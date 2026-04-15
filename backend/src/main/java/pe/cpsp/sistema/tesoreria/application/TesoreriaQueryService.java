package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoListItemResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteListadoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteSerieResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobantesPageResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.HistorialPageResponse;
import pe.cpsp.sistema.tesoreria.api.dto.OperacionTesoreriaResponse;
import pe.cpsp.sistema.tesoreria.api.dto.PagedResponse;
import pe.cpsp.sistema.tesoreria.api.dto.PeriodoCobranzaResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ResumenCajaResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ResumenCanalResponse;
import pe.cpsp.sistema.tesoreria.api.dto.TesoreriaResumenResponse;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;
import pe.cpsp.sistema.tesoreria.domain.model.ConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.MetodoPago;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ComprobanteSerieRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ConceptoCobroRepository;

@Service
@Transactional(readOnly = true)
public class TesoreriaQueryService {

  private final ConceptoCobroRepository conceptoCobroRepository;
  private final ComprobanteSerieRepository comprobanteSerieRepository;
  private final CobroRepository cobroRepository;
  private final ColegiadoRepository colegiadoRepository;
  private final TesoreriaSupport tesoreriaSupport;
  private final Clock appClock;

  public TesoreriaQueryService(
      ConceptoCobroRepository conceptoCobroRepository,
      ComprobanteSerieRepository comprobanteSerieRepository,
      CobroRepository cobroRepository,
      ColegiadoRepository colegiadoRepository,
      TesoreriaSupport tesoreriaSupport,
      Clock appClock) {
    this.conceptoCobroRepository = conceptoCobroRepository;
    this.comprobanteSerieRepository = comprobanteSerieRepository;
    this.cobroRepository = cobroRepository;
    this.colegiadoRepository = colegiadoRepository;
    this.tesoreriaSupport = tesoreriaSupport;
    this.appClock = appClock;
  }

  public TesoreriaResumenResponse getResumen() {
    LocalDate today = LocalDate.now(appClock);
    List<Cobro> cobros = loadCobrosSorted();
    Map<Long, TesoreriaSupport.CobranzaProfile> profiles = buildProfiles(today);

    BigDecimal totalHoy =
        cobros.stream()
            .filter(cobro -> today.equals(cobro.getFechaEmision()))
            .map(Cobro::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long operacionesHoy = cobros.stream().filter(cobro -> today.equals(cobro.getFechaEmision())).count();

    long pendientesUrgentes =
        profiles.values().stream()
            .mapToLong(
                profile ->
                    (profile.ceremoniaPendiente() ? 1L : 0L) + profile.periodosPendientes().size())
            .sum();

    long comprobantesEmitidos = cobros.size();
    long boletasNoImpresas =
        cobros.stream()
            .filter(cobro -> "BOLETA".equals(cobro.getTipoComprobante().name()))
            .filter(cobro -> !cobro.isImpreso())
            .count();

    return new TesoreriaResumenResponse(
        totalHoy,
        operacionesHoy,
        pendientesUrgentes,
        comprobantesEmitidos,
        boletasNoImpresas,
        buildResumenCanales(cobros, today),
        buildEstadoCaja(cobros, today),
        cobros.stream().limit(3).map(this::toOperacionResponse).toList());
  }

  public PagedResponse<CobranzaColegiadoListItemResponse> listColegiados(
      String search, int page, int size) {
    LocalDate today = LocalDate.now(appClock);
    Map<Long, TesoreriaSupport.CobranzaProfile> profiles = buildProfiles(today);
    String normalizedSearch = normalize(search);

    List<CobranzaColegiadoListItemResponse> rows =
        colegiadoRepository.findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc().stream()
            .map(
                colegiado ->
                    new CobranzaColegiadoListItemResponse(
                        colegiado.getId(),
                        colegiado.getCodigoColegiatura(),
                        colegiado.getDni(),
                        buildNombreCompleto(colegiado),
                        tesoreriaSupport.displayEstado(
                            profiles.getOrDefault(
                                    colegiado.getId(),
                                    emptyProfile(colegiado.getId(), today))
                                .habilitado())))
            .filter(
                row ->
                    normalizedSearch.isBlank()
                        || List.of(row.codigoColegiatura(), row.dni(), row.nombreCompleto()).stream()
                            .filter(Objects::nonNull)
                            .map(String::toLowerCase)
                            .anyMatch(value -> value.contains(normalizedSearch)))
            .toList();

    return paginate(rows, page, size);
  }

  public CobranzaColegiadoDetailResponse getColegiadoCobranza(Long colegiadoId) {
    LocalDate today = LocalDate.now(appClock);
    Colegiado colegiado =
        colegiadoRepository
            .findById(colegiadoId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));

    TesoreriaSupport.CobranzaProfile profile =
        buildProfiles(today).getOrDefault(colegiadoId, emptyProfile(colegiadoId, today));

    return new CobranzaColegiadoDetailResponse(
        colegiado.getId(),
        colegiado.getCodigoColegiatura(),
        colegiado.getDni(),
        buildNombreCompleto(colegiado),
        tesoreriaSupport.displayEstado(profile.habilitado()),
        profile.habilitadoHasta(),
        profile.fechaUltimoPago(),
        profile.ultimoPeriodoPagado() != null
            ? profile.ultimoPeriodoPagado().toString()
            : null,
        profile.saldoPendienteTotal(),
        profile.ceremoniaPendiente(),
        profile.periodosPendientes().size(),
        colegiado.getRuc(),
        List.copyOf(colegiado.getEspecialidades()),
        profile.periodosMensuales().stream()
            .map(
                period ->
                    new PeriodoCobranzaResponse(
                        period.period().toString(),
                        period.label(),
                        period.status(),
                        period.selectable()))
            .toList());
  }

  public List<ConceptoCobroResponse> listConceptosCobro() {
    return conceptoCobroRepository.findByEstadoOrderByCategoriaAscNombreAsc(EstadoConceptoCobro.ACTIVO)
        .stream()
        .map(this::toConceptoResponse)
        .toList();
  }

  public List<ComprobanteSerieResponse> listSeriesActivas() {
    return comprobanteSerieRepository.findByActivaTrueOrderByTipoAscSerieAsc().stream()
        .map(this::toSerieResponse)
        .toList();
  }

  public HistorialPageResponse getHistorial(String search, String metodoPago, int page, int size) {
    LocalDate today = LocalDate.now(appClock);
    LocalDate sevenDaysAgo = today.minusDays(6);
    List<Cobro> cobros = loadCobrosSorted();

    Predicate<Cobro> matchesSearch =
        cobro -> {
          String normalizedSearch = normalize(search);
          if (normalizedSearch.isBlank()) {
            return true;
          }
          return List.of(
                  tesoreriaSupport.toReference(cobro.getId()),
                  buildNombreCompleto(cobro.getColegiado()),
                  tesoreriaSupport.buildConceptSummary(cobro),
                  cobro.getSerie() + "-" + cobro.getNumeroComprobante())
              .stream()
              .filter(Objects::nonNull)
              .map(String::toLowerCase)
              .anyMatch(value -> value.contains(normalizedSearch));
        };

    Predicate<Cobro> matchesMethod =
        cobro -> {
          String normalizedMethod = normalize(metodoPago);
          if (normalizedMethod.isBlank() || "todos".equals(normalizedMethod)) {
            return true;
          }
          return normalizeMetodoPagoLabel(cobro.getMetodoPago()).equalsIgnoreCase(metodoPago);
        };

    List<OperacionTesoreriaResponse> rows =
        cobros.stream()
            .filter(matchesSearch.and(matchesMethod))
            .map(this::toOperacionResponse)
            .toList();

    BigDecimal totalHoy =
        cobros.stream()
            .filter(cobro -> today.equals(cobro.getFechaEmision()))
            .map(Cobro::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long operacionesHoy = cobros.stream().filter(cobro -> today.equals(cobro.getFechaEmision())).count();

    BigDecimal totalUltimosSieteDias =
        cobros.stream()
            .filter(cobro -> !cobro.getFechaEmision().isBefore(sevenDaysAgo))
            .map(Cobro::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long operacionesUltimosSieteDias =
        cobros.stream().filter(cobro -> !cobro.getFechaEmision().isBefore(sevenDaysAgo)).count();

    BigDecimal ticketPromedio =
        cobros.isEmpty()
            ? BigDecimal.ZERO
            : cobros.stream()
                .map(Cobro::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(cobros.size()), 2, RoundingMode.HALF_UP);

    return new HistorialPageResponse(
        totalHoy,
        operacionesHoy,
        totalUltimosSieteDias,
        operacionesUltimosSieteDias,
        ticketPromedio,
        paginate(rows, page, size));
  }

  public ComprobantesPageResponse getComprobantes(
      String search, String printStatus, String tipo, int page, int size) {
    List<Cobro> cobros = loadCobrosSorted();
    String normalizedSearch = normalize(search);

    List<ComprobanteListadoResponse> rows =
        cobros.stream()
            .filter(
                cobro ->
                    normalizedSearch.isBlank()
                        || List.of(
                                cobro.getSerie(),
                                String.valueOf(cobro.getNumeroComprobante()),
                                buildNombreCompleto(cobro.getColegiado()),
                                cobro.getTipoComprobante().name())
                            .stream()
                            .map(String::toLowerCase)
                            .anyMatch(value -> value.contains(normalizedSearch)))
            .filter(
                cobro ->
                    normalize(printStatus).isBlank()
                        || "todos".equalsIgnoreCase(printStatus)
                        || ("impreso".equalsIgnoreCase(printStatus) && cobro.isImpreso())
                        || ("no impreso".equalsIgnoreCase(printStatus) && !cobro.isImpreso()))
            .filter(
                cobro ->
                    normalize(tipo).isBlank()
                        || "todos".equalsIgnoreCase(tipo)
                        || cobro.getTipoComprobante().name().equalsIgnoreCase(tipo))
            .map(this::toComprobanteResponse)
            .toList();

    return new ComprobantesPageResponse(
        cobros.stream().filter(cobro -> cobro.getTipoComprobante().name().equals("BOLETA")).count(),
        cobros.stream().filter(cobro -> cobro.getTipoComprobante().name().equals("FACTURA")).count(),
        cobros.stream().filter(cobro -> !cobro.isImpreso()).count(),
        listSeriesActivas(),
        paginate(rows, page, size));
  }

  private List<Cobro> loadCobrosSorted() {
    return cobroRepository.findAllWithDetails().stream()
        .sorted(Comparator.comparing(Cobro::getFechaEmision).reversed().thenComparing(Cobro::getId).reversed())
        .toList();
  }

  private Map<Long, TesoreriaSupport.CobranzaProfile> buildProfiles(LocalDate today) {
    Map<String, ConceptoCobro> conceptosByCode =
        conceptoCobroRepository.findAll().stream()
            .collect(
                LinkedHashMap::new,
                (map, concept) -> map.put(concept.getCodigo(), concept),
                LinkedHashMap::putAll);

    BigDecimal ceremonyAmountRaw =
        conceptosByCode.getOrDefault(TesoreriaSupport.CODIGO_CEREMONIA, new ConceptoCobro()).getMontoBase();
    BigDecimal aportacionAmountRaw =
        conceptosByCode.getOrDefault(TesoreriaSupport.CODIGO_APORTACION_MENSUAL, new ConceptoCobro())
            .getMontoBase();
    final BigDecimal ceremoniaMonto = ceremonyAmountRaw == null ? BigDecimal.ZERO : ceremonyAmountRaw;
    final BigDecimal aportacionMonto =
        aportacionAmountRaw == null ? BigDecimal.ZERO : aportacionAmountRaw;

    Map<Long, List<Cobro>> cobrosByColegiado =
        loadCobrosSorted().stream()
            .collect(
                LinkedHashMap::new,
                (map, cobro) ->
                    map.computeIfAbsent(cobro.getColegiado().getId(), ignored -> new java.util.ArrayList<>())
                        .add(cobro),
                LinkedHashMap::putAll);

    Map<Long, TesoreriaSupport.CobranzaProfile> profiles = new LinkedHashMap<>();
    colegiadoRepository.findAll().forEach(
        colegiado ->
            profiles.put(
                colegiado.getId(),
                tesoreriaSupport.buildProfile(
                    colegiado,
                    cobrosByColegiado.getOrDefault(colegiado.getId(), List.of()),
                    today,
                    ceremoniaMonto,
                    aportacionMonto)));

    return profiles;
  }

  private List<ResumenCanalResponse> buildResumenCanales(List<Cobro> cobros, LocalDate today) {
    List<MetodoPago> paymentMethods =
        List.of(
            MetodoPago.EFECTIVO,
            MetodoPago.TRANSFERENCIA,
            MetodoPago.POS_TARJETA,
            MetodoPago.YAPE_PLIN);

    BigDecimal totalDia =
        cobros.stream()
            .filter(cobro -> today.equals(cobro.getFechaEmision()))
            .map(Cobro::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    return paymentMethods.stream()
        .map(
            method -> {
              List<Cobro> cobrosDelMetodo =
                  cobros.stream()
                      .filter(cobro -> today.equals(cobro.getFechaEmision()))
                      .filter(cobro -> cobro.getMetodoPago() == method)
                      .toList();

              BigDecimal amount =
                  cobrosDelMetodo.stream()
                      .map(Cobro::getTotal)
                      .reduce(BigDecimal.ZERO, BigDecimal::add);

              long percentage =
                  totalDia.compareTo(BigDecimal.ZERO) == 0
                      ? 0
                      : amount.multiply(BigDecimal.valueOf(100))
                          .divide(totalDia, 0, RoundingMode.HALF_UP)
                          .longValue();

              return new ResumenCanalResponse(
                  normalizeMetodoPagoLabel(method),
                  percentage,
                  amount,
                  cobrosDelMetodo.size());
            })
        .toList();
  }

  private List<ResumenCajaResponse> buildEstadoCaja(List<Cobro> cobros, LocalDate today) {
    List<MetodoPago> paymentMethods =
        List.of(
            MetodoPago.EFECTIVO,
            MetodoPago.TRANSFERENCIA,
            MetodoPago.POS_TARJETA,
            MetodoPago.YAPE_PLIN);

    return paymentMethods.stream()
        .map(
            method -> {
              List<Cobro> cobrosDelMetodo =
                  cobros.stream()
                      .filter(cobro -> today.equals(cobro.getFechaEmision()))
                      .filter(cobro -> cobro.getMetodoPago() == method)
                      .toList();
              BigDecimal amount =
                  cobrosDelMetodo.stream()
                      .map(Cobro::getTotal)
                      .reduce(BigDecimal.ZERO, BigDecimal::add);
              return new ResumenCajaResponse(
                  normalizeMetodoPagoLabel(method), amount, cobrosDelMetodo.size());
            })
        .toList();
  }

  private OperacionTesoreriaResponse toOperacionResponse(Cobro cobro) {
    return new OperacionTesoreriaResponse(
        cobro.getId(),
        tesoreriaSupport.toReference(cobro.getId()),
        cobro.getFechaEmision(),
        buildNombreCompleto(cobro.getColegiado()),
        tesoreriaSupport.buildConceptSummary(cobro),
        normalizeMetodoPagoLabel(cobro.getMetodoPago()),
        cobro.getTotal(),
        cobro.getSerie(),
        cobro.getNumeroComprobante(),
        cobro.getEstado());
  }

  private ComprobanteListadoResponse toComprobanteResponse(Cobro cobro) {
    return new ComprobanteListadoResponse(
        cobro.getId(),
        cobro.getTipoComprobante().name(),
        cobro.getSerie(),
        cobro.getNumeroComprobante(),
        buildNombreCompleto(cobro.getColegiado()),
        cobro.getFechaEmision(),
        cobro.getTotal(),
        cobro.getEstado(),
        cobro.isImpreso());
  }

  private ConceptoCobroResponse toConceptoResponse(ConceptoCobro concepto) {
    return new ConceptoCobroResponse(
        concepto.getId(),
        concepto.getCodigo(),
        concepto.getNombre(),
        concepto.getCategoria().name(),
        concepto.getDescripcion(),
        concepto.getMontoBase(),
        concepto.isUsaPeriodo(),
        concepto.isPermiteCantidad(),
        concepto.isAdmiteDescuento(),
        concepto.isAdmiteMora(),
        concepto.isAfectaHabilitacion(),
        concepto.isExoneradoIgv(),
        concepto.isRequiereAdjunto(),
        concepto.getEstado().name());
  }

  private ComprobanteSerieResponse toSerieResponse(ComprobanteSerie serie) {
    return new ComprobanteSerieResponse(
        serie.getId(),
        serie.getTipo().name(),
        serie.getSerie(),
        serie.getCorrelativoActual(),
        serie.isActiva());
  }

  private <T> PagedResponse<T> paginate(List<T> rows, int page, int size) {
    int safeSize = Math.max(size, 1);
    int safePage = Math.max(page, 1);
    int fromIndex = Math.min((safePage - 1) * safeSize, rows.size());
    int toIndex = Math.min(fromIndex + safeSize, rows.size());
    int totalPages = rows.isEmpty() ? 1 : (int) Math.ceil((double) rows.size() / safeSize);

    return new PagedResponse<>(rows.subList(fromIndex, toIndex), safePage, safeSize, rows.size(), totalPages);
  }

  private TesoreriaSupport.CobranzaProfile emptyProfile(Long colegiadoId, LocalDate today) {
    return new TesoreriaSupport.CobranzaProfile(
        colegiadoId,
        true,
        null,
        null,
        null,
        false,
        BigDecimal.ZERO,
        List.of(),
        List.of());
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

  private String normalize(String value) {
    return value == null ? "" : value.trim().toLowerCase();
  }

  public String normalizeMetodoPagoLabel(MetodoPago metodoPago) {
    return switch (metodoPago) {
      case EFECTIVO -> "Efectivo";
      case YAPE_PLIN -> "Yape/Plin";
      case TRANSFERENCIA -> "Transferencia";
      case POS_TARJETA -> "POS/Tarjeta";
    };
  }
}
