package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamientoCuota;
import pe.cpsp.sistema.tesoreria.domain.model.Fraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.FraccionamientoCuota;

@Component
class TesoreriaSupport {

  static final String CODIGO_APORTACION_MENSUAL = "APO-MEN";
  static final String CODIGO_CEREMONIA = "CER-JUR";
  static final String CODIGO_FRACCIONAMIENTO = "FRAC-CUO";
  private static final int FUTURE_SELECTION_YEARS = 2;
  private static final List<String> MONTH_LABELS =
      List.of("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");

  CobranzaProfile buildProfile(
      Colegiado colegiado,
      List<Cobro> cobros,
      List<Fraccionamiento> fraccionamientos,
      LocalDate today,
      BigDecimal ceremoniaMonto,
      BigDecimal aportacionMonto) {
    List<CobroDetalle> qualifyingDetails =
        cobros.stream()
            .flatMap(cobro -> cobro.getDetalles().stream())
            .filter(Objects::nonNull)
            .filter(
                detalle ->
                    detalle.getConceptoCobro() != null
                        && List.of(CODIGO_CEREMONIA, CODIGO_APORTACION_MENSUAL)
                            .contains(detalle.getConceptoCobro().getCodigo()))
            .toList();

    List<CobroDetalle> ceremonyDetails =
        qualifyingDetails.stream()
            .filter(detalle -> CODIGO_CEREMONIA.equals(detalle.getConceptoCobro().getCodigo()))
            .toList();

    List<CobroDetalle> monthlyDetails =
        qualifyingDetails.stream()
            .filter(detalle -> CODIGO_APORTACION_MENSUAL.equals(detalle.getConceptoCobro().getCodigo()))
            .filter(detalle -> detalle.getPeriodoReferencia() != null && !detalle.getPeriodoReferencia().isBlank())
            .toList();

    boolean ceremoniaPendiente = ceremonyDetails.isEmpty();
    LocalDate ceremonyPaymentDate =
        ceremonyDetails.stream()
            .map(detalle -> detalle.getCobro().getFechaEmision())
            .filter(Objects::nonNull)
            .sorted()
            .findFirst()
            .orElse(null);

    LocalDate fechaUltimoPago =
        qualifyingDetails.stream()
            .map(detalle -> detalle.getCobro().getFechaEmision())
            .filter(Objects::nonNull)
            .max(LocalDate::compareTo)
            .orElse(null);

    LocalDate habilitadoHasta = fechaUltimoPago != null ? fechaUltimoPago.plusMonths(3) : null;
    boolean habilitado = habilitadoHasta != null && !today.isAfter(habilitadoHasta);

    Set<YearMonth> paidPeriods =
        monthlyDetails.stream()
            .map(CobroDetalle::getPeriodoReferencia)
            .map(this::parsePeriod)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));

    YearMonth ultimoPeriodoPagado =
        paidPeriods.stream().max(YearMonth::compareTo).orElse(null);

    YearMonth firstDueMonth =
        ceremonyPaymentDate != null ? YearMonth.from(ceremonyPaymentDate).plusMonths(1) : null;
    YearMonth currentMonth = YearMonth.from(today);
    Fraccionamiento activeFraccionamiento =
        fraccionamientos.stream()
            .filter(fraccionamiento -> fraccionamiento.getEstado() == EstadoFraccionamiento.ACTIVO)
            .findFirst()
            .orElse(null);
    Set<YearMonth> refinancedPeriods =
        fraccionamientos.stream()
            .filter(
                fraccionamiento ->
                    fraccionamiento.getEstado() == EstadoFraccionamiento.ACTIVO
                        || fraccionamiento.getEstado() == EstadoFraccionamiento.PAGADO)
            .flatMap(fraccionamiento -> fraccionamiento.getPeriodos().stream())
            .map(periodo -> parsePeriod(periodo.getPeriodoReferencia()))
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
    List<YearMonth> pendingPeriods = new ArrayList<>();

    if (firstDueMonth != null) {
      YearMonth cursor = firstDueMonth;
      while (!cursor.isAfter(currentMonth)) {
        if (!paidPeriods.contains(cursor) && !refinancedPeriods.contains(cursor)) {
          pendingPeriods.add(cursor);
        }
        cursor = cursor.plusMonths(1);
      }
    }

    BigDecimal fraccionamientoPendiente =
        activeFraccionamiento == null
            ? BigDecimal.ZERO
            : activeFraccionamiento.getCuotas().stream()
                .filter(cuota -> cuota.getEstado() == EstadoFraccionamientoCuota.PENDIENTE)
                .map(FraccionamientoCuota::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal saldoPendienteTotal =
        (ceremoniaPendiente ? ceremoniaMonto : BigDecimal.ZERO)
            .add(aportacionMonto.multiply(BigDecimal.valueOf(pendingPeriods.size())))
            .add(fraccionamientoPendiente);

    BigDecimal montoFraccionable =
        ceremoniaPendiente
            ? BigDecimal.ZERO
            : aportacionMonto.multiply(BigDecimal.valueOf(pendingPeriods.size()));

    List<PeriodoCobranza> periodStates = new ArrayList<>();
    if (firstDueMonth != null) {
      YearMonth ceremonyMonth =
          ceremonyPaymentDate != null ? YearMonth.from(ceremonyPaymentDate) : null;
      YearMonth displayStart =
          ceremonyMonth != null ? YearMonth.of(ceremonyMonth.getYear(), 1) : firstDueMonth;
      YearMonth displayEnd = YearMonth.of(today.getYear() + FUTURE_SELECTION_YEARS, 12);

      if (!displayStart.isAfter(displayEnd)) {
        YearMonth graceStart = null;
        YearMonth graceEnd = null;

        if (ultimoPeriodoPagado != null) {
          graceStart = ultimoPeriodoPagado.plusMonths(1);
          graceEnd = ultimoPeriodoPagado.plusMonths(3);
        } else if (firstDueMonth != null && ceremonyPaymentDate != null) {
          graceStart = firstDueMonth;
          graceEnd = firstDueMonth.plusMonths(2);
        }

        YearMonth cursor = displayStart;
        boolean graceWindowStillOpen =
            graceEnd != null && !YearMonth.from(today).isAfter(graceEnd);

        while (!cursor.isAfter(displayEnd)) {
          boolean beforeCeremonyYearMonth =
              ceremonyMonth != null
                  && cursor.getYear() == ceremonyMonth.getYear()
                  && cursor.isBefore(ceremonyMonth);
          boolean coveredByCeremony =
              ceremonyMonth != null
                  && ceremonyMonth.equals(cursor)
                  && cursor.isBefore(firstDueMonth);

          String status;
          boolean selectable;
          if (beforeCeremonyYearMonth) {
            status = "NOT_APPLICABLE";
            selectable = false;
          } else if (paidPeriods.contains(cursor) || coveredByCeremony) {
            status = "PAID";
            selectable = false;
          } else if (refinancedPeriods.contains(cursor)) {
            status = "REFINANCED";
            selectable = false;
          } else if (
              graceWindowStillOpen
                  && graceStart != null
                  && !cursor.isBefore(graceStart)
                  && !cursor.isAfter(graceEnd)) {
            status = "GRACE";
            selectable = true;
          } else if (cursor.isAfter(currentMonth)) {
            status = "UPCOMING";
            selectable = true;
          } else {
            status = "OVERDUE";
            selectable = true;
          }

          periodStates.add(new PeriodoCobranza(cursor, formatPeriod(cursor), status, selectable));
          cursor = cursor.plusMonths(1);
        }
      }
    }

    return new CobranzaProfile(
        colegiado.getId(),
        ceremoniaPendiente,
        fechaUltimoPago,
        ultimoPeriodoPagado,
        habilitadoHasta,
        habilitado,
        saldoPendienteTotal,
        montoFraccionable,
        pendingPeriods,
        periodStates,
        activeFraccionamiento);
  }

  FraccionamientoCuota findNextPendingCuota(Fraccionamiento fraccionamiento) {
    if (fraccionamiento == null) {
      return null;
    }

    return fraccionamiento.getCuotas().stream()
        .filter(cuota -> cuota.getEstado() == EstadoFraccionamientoCuota.PENDIENTE)
        .sorted(Comparator.comparing(FraccionamientoCuota::getNumeroCuota))
        .findFirst()
        .orElse(null);
  }

  String buildConceptSummary(Cobro cobro) {
    return cobro.getDetalles().stream()
        .map(detalle -> detalle.getConceptoCobro().getNombre())
        .distinct()
        .collect(Collectors.joining(" + "));
  }

  String formatPeriod(YearMonth period) {
    return MONTH_LABELS.get(period.getMonthValue() - 1) + " " + period.getYear();
  }

  YearMonth parsePeriod(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    try {
      return YearMonth.parse(value);
    } catch (RuntimeException ignored) {
      return null;
    }
  }

  String toReference(Long id) {
    return "#" + id;
  }

  String displayEstado(boolean habilitado) {
    return habilitado ? "HABILITADO" : "NO_HABILITADO";
  }

  record CobranzaProfile(
      Long colegiadoId,
      boolean ceremoniaPendiente,
      LocalDate fechaUltimoPago,
      YearMonth ultimoPeriodoPagado,
      LocalDate habilitadoHasta,
      boolean habilitado,
      BigDecimal saldoPendienteTotal,
      BigDecimal montoFraccionable,
      List<YearMonth> periodosPendientes,
      List<PeriodoCobranza> periodosMensuales,
      Fraccionamiento fraccionamientoActivo) {}

  record PeriodoCobranza(YearMonth period, String label, String status, boolean selectable) {}
}
