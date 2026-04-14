package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;

@Component
class TesoreriaSupport {

  static final String CODIGO_APORTACION_MENSUAL = "APO-MEN";
  static final String CODIGO_CEREMONIA = "CER-JUR";
  private static final List<String> MONTH_LABELS =
      List.of("Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");

  CobranzaProfile buildProfile(
      Colegiado colegiado,
      List<Cobro> cobros,
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
    List<YearMonth> pendingPeriods = new ArrayList<>();

    if (firstDueMonth != null) {
      YearMonth cursor = firstDueMonth;
      while (!cursor.isAfter(currentMonth)) {
        if (!paidPeriods.contains(cursor)) {
          pendingPeriods.add(cursor);
        }
        cursor = cursor.plusMonths(1);
      }
    }

    BigDecimal saldoPendienteTotal =
        (ceremoniaPendiente ? ceremoniaMonto : BigDecimal.ZERO)
            .add(aportacionMonto.multiply(BigDecimal.valueOf(pendingPeriods.size())));

    List<PeriodoCobranza> periodStates = new ArrayList<>();
    if (firstDueMonth != null) {
      YearMonth currentYearStart = YearMonth.of(today.getYear(), 1);
      YearMonth currentYearEnd = YearMonth.of(today.getYear(), 12);
      YearMonth ceremonyMonth =
          ceremonyPaymentDate != null ? YearMonth.from(ceremonyPaymentDate) : null;
      YearMonth displayStart =
          ceremonyMonth != null && ceremonyMonth.getYear() == today.getYear()
              ? ceremonyMonth
              : currentYearStart;

      if (!displayStart.isAfter(currentYearEnd)) {
        YearMonth graceStart =
            ultimoPeriodoPagado != null ? ultimoPeriodoPagado.plusMonths(1) : firstDueMonth;
        YearMonth graceEnd =
            habilitadoHasta != null ? YearMonth.from(habilitadoHasta) : YearMonth.from(today);
        YearMonth cursor = displayStart;

        while (!cursor.isAfter(currentYearEnd)) {
          boolean coveredByCeremony =
              ceremonyMonth != null
                  && ceremonyMonth.equals(cursor)
                  && cursor.isBefore(firstDueMonth);

          String status;
          boolean selectable;
          if (paidPeriods.contains(cursor) || coveredByCeremony) {
            status = "PAID";
            selectable = false;
          } else if (
              habilitado
                  && graceStart != null
                  && !cursor.isBefore(graceStart)
                  && !cursor.isAfter(graceEnd)) {
            status = "GRACE";
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
        pendingPeriods,
        periodStates);
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
      List<YearMonth> periodosPendientes,
      List<PeriodoCobranza> periodosMensuales) {}

  record PeriodoCobranza(YearMonth period, String label, String status, boolean selectable) {}
}
