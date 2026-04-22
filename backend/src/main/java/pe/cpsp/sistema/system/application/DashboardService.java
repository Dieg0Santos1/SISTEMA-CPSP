package pe.cpsp.sistema.system.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Year;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.inventario.domain.model.InventarioVenta;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioVentaRepository;
import pe.cpsp.sistema.system.api.DashboardMonthlyPointResponse;
import pe.cpsp.sistema.system.api.DashboardOverviewResponse;
import pe.cpsp.sistema.system.api.DashboardRecentActivityResponse;
import pe.cpsp.sistema.system.api.DashboardTrendResponse;
import pe.cpsp.sistema.system.api.DashboardUpcomingCeremonyResponse;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroDetalleRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

  private static final String ESTADO_HABILITADO = "HABILITADO";
  private static final String CODIGO_APORTACION_MENSUAL = "APO-MEN";
  private static final Locale DASHBOARD_LOCALE = Locale.forLanguageTag("es-PE");

  private final ColegiadoService colegiadoService;
  private final ColegiadoRepository colegiadoRepository;
  private final CobroRepository cobroRepository;
  private final CobroDetalleRepository cobroDetalleRepository;
  private final InventarioVentaRepository inventarioVentaRepository;
  private final Clock appClock;

  public DashboardService(
      ColegiadoService colegiadoService,
      ColegiadoRepository colegiadoRepository,
      CobroRepository cobroRepository,
      CobroDetalleRepository cobroDetalleRepository,
      InventarioVentaRepository inventarioVentaRepository,
      Clock appClock) {
    this.colegiadoService = colegiadoService;
    this.colegiadoRepository = colegiadoRepository;
    this.cobroRepository = cobroRepository;
    this.cobroDetalleRepository = cobroDetalleRepository;
    this.inventarioVentaRepository = inventarioVentaRepository;
    this.appClock = appClock;
  }

  public DashboardOverviewResponse getOverview() {
    LocalDate today = LocalDate.now(appClock);
    Year currentYear = Year.from(today);
    YearMonth currentMonth = YearMonth.from(today);
    YearMonth previousMonth = currentMonth.minusMonths(1);

    List<ColegiadoResponse> colegiados = colegiadoService.listAll();
    List<Cobro> cobros = cobroRepository.findAllWithDetails();
    List<InventarioVenta> ventas = inventarioVentaRepository.findAllByOrderByFechaVentaDescIdDesc();

    long totalColegiados = colegiados.size();
    long habilitados =
        colegiados.stream().filter(colegiado -> ESTADO_HABILITADO.equals(colegiado.estado())).count();
    long inactivos = Math.max(0, totalColegiados - habilitados);

    Map<Month, BigDecimal> colegiadosSeries = initializeMonthlyMap();
    for (ColegiadoResponse colegiado : colegiados) {
      if (colegiado.fechaIniciacion() == null || !currentYear.equals(Year.from(colegiado.fechaIniciacion()))) {
        continue;
      }
      Month month = colegiado.fechaIniciacion().getMonth();
      colegiadosSeries.computeIfPresent(month, (ignored, value) -> value.add(BigDecimal.ONE));
    }

    BigDecimal altasMesActual = countColegiadosInMonth(colegiados, currentMonth);
    BigDecimal altasMesAnterior = countColegiadosInMonth(colegiados, previousMonth);

    BigDecimal ingresosMensuales =
        sumCobrosForMonth(cobros, currentMonth).add(sumVentasForMonth(ventas, currentMonth));

    Map<Month, BigDecimal> aportacionesSeries = initializeMonthlyMap();
    for (Cobro cobro : cobros) {
      if (cobro.getFechaEmision() == null || !currentYear.equals(Year.from(cobro.getFechaEmision()))) {
        continue;
      }

      BigDecimal totalAportacionesMes =
          cobro.getDetalles().stream()
              .filter(detalle -> isAportacion(detalle))
              .map(CobroDetalle::getTotalLinea)
              .filter(Objects::nonNull)
              .reduce(BigDecimal.ZERO, BigDecimal::add);

      Month month = cobro.getFechaEmision().getMonth();
      aportacionesSeries.computeIfPresent(month, (ignored, value) -> value.add(totalAportacionesMes));
    }

    return new DashboardOverviewResponse(
        totalColegiados,
        calculateVariationPercentage(altasMesActual, altasMesAnterior),
        habilitados,
        calculatePercentage(habilitados, totalColegiados),
        inactivos,
        calculatePercentage(inactivos, totalColegiados),
        ingresosMensuales,
        toMonthLabel(currentMonth.getMonth()),
        currentYear.getValue(),
        buildTrendResponse(colegiadosSeries, currentMonth.getMonth()),
        buildTrendResponse(aportacionesSeries, currentMonth.getMonth()),
        buildRecentActivity(colegiados, cobros, ventas),
        getUpcomingCeremonies());
  }

  public List<DashboardUpcomingCeremonyResponse> getUpcomingCeremonies() {
    return buildUpcomingCeremonies();
  }

  private Map<Month, BigDecimal> initializeMonthlyMap() {
    Map<Month, BigDecimal> monthlyValues = new LinkedHashMap<>();
    for (Month month : Month.values()) {
      monthlyValues.put(month, BigDecimal.ZERO);
    }
    return monthlyValues;
  }

  private BigDecimal sumCobrosForMonth(List<Cobro> cobros, YearMonth targetMonth) {
    return cobros.stream()
        .filter(cobro -> cobro.getFechaEmision() != null)
        .filter(cobro -> YearMonth.from(cobro.getFechaEmision()).equals(targetMonth))
        .map(Cobro::getTotal)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private BigDecimal sumVentasForMonth(List<InventarioVenta> ventas, YearMonth targetMonth) {
    return ventas.stream()
        .filter(venta -> venta.getFechaVenta() != null)
        .filter(venta -> YearMonth.from(venta.getFechaVenta()).equals(targetMonth))
        .map(InventarioVenta::getTotal)
        .filter(Objects::nonNull)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private boolean isAportacion(CobroDetalle detalle) {
    return detalle.getConceptoCobro() != null
        && CODIGO_APORTACION_MENSUAL.equals(detalle.getConceptoCobro().getCodigo());
  }

  private BigDecimal countColegiadosInMonth(List<ColegiadoResponse> colegiados, YearMonth targetMonth) {
    long count =
        colegiados.stream()
            .filter(colegiado -> colegiado.fechaIniciacion() != null)
            .filter(colegiado -> YearMonth.from(colegiado.fechaIniciacion()).equals(targetMonth))
            .count();

    return BigDecimal.valueOf(count);
  }

  private long calculatePercentage(long value, long total) {
    if (total <= 0) {
      return 0;
    }

    return BigDecimal.valueOf(value)
        .multiply(BigDecimal.valueOf(100))
        .divide(BigDecimal.valueOf(total), 0, RoundingMode.HALF_UP)
        .longValue();
  }

  private BigDecimal calculateVariationPercentage(BigDecimal current, BigDecimal previous) {
    if (current.compareTo(BigDecimal.ZERO) == 0 && previous.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
    }

    if (previous.compareTo(BigDecimal.ZERO) == 0) {
      return BigDecimal.valueOf(100).setScale(1, RoundingMode.HALF_UP);
    }

    return current
        .subtract(previous)
        .multiply(BigDecimal.valueOf(100))
        .divide(previous, 1, RoundingMode.HALF_UP);
  }

  private DashboardTrendResponse buildTrendResponse(
      Map<Month, BigDecimal> monthlyValues, Month currentMonth) {
    BigDecimal total =
        monthlyValues.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal current =
        monthlyValues.getOrDefault(currentMonth, BigDecimal.ZERO);
    BigDecimal average =
        total.compareTo(BigDecimal.ZERO) == 0
            ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
            : total.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);

    Map.Entry<Month, BigDecimal> bestMonth =
        monthlyValues.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .orElse(Map.entry(currentMonth, BigDecimal.ZERO));

    return new DashboardTrendResponse(
        total,
        current,
        average,
        toMonthLabel(bestMonth.getKey()),
        bestMonth.getValue(),
        monthlyValues.entrySet().stream()
            .map(entry -> new DashboardMonthlyPointResponse(toMonthLabel(entry.getKey()), entry.getValue()))
            .toList());
  }

  private List<DashboardRecentActivityResponse> buildRecentActivity(
      List<ColegiadoResponse> colegiados, List<Cobro> cobros, List<InventarioVenta> ventas) {
    List<DashboardRecentActivitySeed> items =
        java.util.stream.Stream.of(
                colegiados.stream()
                    .map(
                        colegiado ->
                            new DashboardRecentActivitySeed(
                                "COLEGIADO",
                                colegiado.nombreCompleto(),
                                "Registro incorporado al padron institucional",
                                resolveCreatedAt(colegiado.id()))),
                cobros.stream()
                    .map(
                        cobro ->
                            new DashboardRecentActivitySeed(
                                "COBRO",
                                formatCurrencyAmount(cobro.getTotal()) + " recibidos",
                                buildCobroDetail(cobro),
                                cobro.getCreatedAt())),
                ventas.stream()
                    .map(
                        venta ->
                            new DashboardRecentActivitySeed(
                                "VENTA",
                                formatCurrencyAmount(venta.getTotal()) + " en venta",
                                "Venta de productos a " + venta.getClienteNombre(),
                                venta.getCreatedAt())))
            .flatMap(stream -> stream)
            .filter(item -> item.timestamp() != null)
            .sorted(java.util.Comparator.comparing(DashboardRecentActivitySeed::timestamp).reversed())
            .limit(6)
            .toList();

    return items.stream()
        .map(
            item ->
                new DashboardRecentActivityResponse(
                    item.tipo(), item.title(), item.detail(), item.timestamp()))
        .toList();
  }

  private List<DashboardUpcomingCeremonyResponse> buildUpcomingCeremonies() {
    java.util.Set<Long> colegiadosConPagoHabilitacion =
        cobroDetalleRepository.findPagosQueAfectanHabilitacion().stream()
            .map(detalle -> detalle.getCobro().getColegiado().getId())
            .collect(java.util.stream.Collectors.toSet());

    LocalDate firstCeremonyDate = nextCeremonyDate(LocalDate.now(appClock));

    List<Colegiado> candidates =
        colegiadoRepository.findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc().stream()
            .filter(colegiado -> !colegiadosConPagoHabilitacion.contains(colegiado.getId()))
            .sorted(
                java.util.Comparator.comparing(Colegiado::getFechaIniciacion, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()))
                    .thenComparing(Colegiado::getId))
            .limit(6)
            .toList();

    return java.util.stream.IntStream.range(0, candidates.size())
        .mapToObj(
            index -> {
              Colegiado colegiado = candidates.get(index);
              LocalDate estimatedDate = firstCeremonyDate.plusWeeks(index / 3);

              return new DashboardUpcomingCeremonyResponse(
                  colegiado.getId(),
                  colegiado.getCodigoColegiatura(),
                  colegiado.getDni(),
                  buildNombreCompleto(colegiado),
                  colegiado.getEspecialidades().isEmpty()
                      ? "Sin especialidad registrada"
                      : colegiado.getEspecialidades().getFirst(),
                  estimatedDate);
            })
        .toList();
  }

  private LocalDateTime resolveCreatedAt(Long colegiadoId) {
    return colegiadoRepository.findById(colegiadoId).map(Colegiado::getCreatedAt).orElse(null);
  }

  private String buildCobroDetail(Cobro cobro) {
    String concepto =
        cobro.getDetalles().stream()
            .map(CobroDetalle::getConceptoCobro)
            .filter(Objects::nonNull)
            .map(conceptoCobro -> conceptoCobro.getNombre())
            .findFirst()
            .orElse("Cobro institucional");

    return concepto + " - " + buildNombreCompleto(cobro.getColegiado());
  }

  private String formatCurrencyAmount(BigDecimal amount) {
    return "S/ " + amount.setScale(2, RoundingMode.HALF_UP);
  }

  private String buildNombreCompleto(Colegiado colegiado) {
    return List.of(colegiado.getNombre(), colegiado.getApellidoPaterno(), colegiado.getApellidoMaterno())
        .stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(value -> !value.isBlank())
        .reduce((left, right) -> left + " " + right)
        .orElse("");
  }

  private LocalDate nextCeremonyDate(LocalDate baseDate) {
    LocalDate candidate = baseDate.plusDays(1);
    while (candidate.getDayOfWeek().getValue() != 5) {
      candidate = candidate.plusDays(1);
    }
    return candidate;
  }

  private String toMonthLabel(Month month) {
    return month.getDisplayName(TextStyle.SHORT, DASHBOARD_LOCALE).replace(".", "").toUpperCase(DASHBOARD_LOCALE);
  }

  private record DashboardRecentActivitySeed(
      String tipo,
      String title,
      String detail,
      LocalDateTime timestamp) {}
}
