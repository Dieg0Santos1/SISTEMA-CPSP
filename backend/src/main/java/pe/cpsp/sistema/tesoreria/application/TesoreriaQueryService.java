package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
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
import pe.cpsp.sistema.inventario.domain.model.InventarioVenta;
import pe.cpsp.sistema.inventario.domain.model.InventarioVentaDetalle;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioVentaRepository;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoListItemResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteListadoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteSerieResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobantesPageResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroCatalogoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoCuotaResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoListadoItemResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoPanelDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientosPageResponse;
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
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamientoCuota;
import pe.cpsp.sistema.tesoreria.domain.model.Fraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.FraccionamientoCuota;
import pe.cpsp.sistema.tesoreria.domain.model.MetodoPago;
import pe.cpsp.sistema.tesoreria.domain.model.TipoConceptoCobro;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ComprobanteSerieRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ConceptoCobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.FraccionamientoRepository;

@Service
@Transactional(readOnly = true)
public class TesoreriaQueryService {

  private final ConceptoCobroRepository conceptoCobroRepository;
  private final ComprobanteSerieRepository comprobanteSerieRepository;
  private final CobroRepository cobroRepository;
  private final InventarioVentaRepository inventarioVentaRepository;
  private final ColegiadoRepository colegiadoRepository;
  private final FraccionamientoRepository fraccionamientoRepository;
  private final TesoreriaSupport tesoreriaSupport;
  private final Clock appClock;

  public TesoreriaQueryService(
      ConceptoCobroRepository conceptoCobroRepository,
      ComprobanteSerieRepository comprobanteSerieRepository,
      CobroRepository cobroRepository,
      InventarioVentaRepository inventarioVentaRepository,
      ColegiadoRepository colegiadoRepository,
      FraccionamientoRepository fraccionamientoRepository,
      TesoreriaSupport tesoreriaSupport,
      Clock appClock) {
    this.conceptoCobroRepository = conceptoCobroRepository;
    this.comprobanteSerieRepository = comprobanteSerieRepository;
    this.cobroRepository = cobroRepository;
    this.inventarioVentaRepository = inventarioVentaRepository;
    this.colegiadoRepository = colegiadoRepository;
    this.fraccionamientoRepository = fraccionamientoRepository;
    this.tesoreriaSupport = tesoreriaSupport;
    this.appClock = appClock;
  }

  public TesoreriaResumenResponse getResumen() {
    LocalDate today = LocalDate.now(appClock);
    List<Cobro> cobros = loadCobrosSorted();
    List<CajaOperacion> operaciones = loadCajaOperacionesSorted();
    Map<Long, TesoreriaSupport.CobranzaProfile> profiles = buildProfiles(today);

    BigDecimal totalHoy =
        operaciones.stream()
            .filter(operacion -> today.equals(operacion.fechaPago()))
            .map(CajaOperacion::total)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long operacionesHoy =
        operaciones.stream().filter(operacion -> today.equals(operacion.fechaPago())).count();

    long pendientesUrgentes =
        profiles.values().stream()
            .mapToLong(
                profile ->
                    (profile.ceremoniaPendiente() ? 1L : 0L) + profile.periodosPendientes().size())
            .sum();

    long comprobantesEmitidos = operaciones.size();
    long boletasNoImpresas =
        operaciones.stream()
            .filter(operacion -> "BOLETA".equals(operacion.tipoComprobante()))
            .filter(operacion -> !operacion.impreso())
            .count();

    return new TesoreriaResumenResponse(
        totalHoy,
        operacionesHoy,
        pendientesUrgentes,
        comprobantesEmitidos,
        boletasNoImpresas,
        buildResumenCanales(operaciones, today),
        buildEstadoCaja(operaciones, today),
        operaciones.stream().limit(3).map(this::toOperacionResponse).toList());
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
        profile.montoFraccionable(),
        !profile.ceremoniaPendiente()
            && profile.fraccionamientoActivo() == null
            && profile.montoFraccionable().compareTo(BigDecimal.ZERO) > 0,
        profile.periodosPendientes().stream().map(YearMonth::toString).toList(),
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
            .toList(),
        toFraccionamientoResponse(profile.fraccionamientoActivo()));
  }

  public List<ConceptoCobroResponse> listConceptosCobro() {
    return conceptoCobroRepository.findByEstadoOrderByCategoriaAscNombreAsc(EstadoConceptoCobro.ACTIVO)
        .stream()
        .filter(concepto -> !TesoreriaSupport.CODIGO_FRACCIONAMIENTO.equals(concepto.getCodigo()))
        .map(this::toConceptoResponse)
        .toList();
  }

  public ConceptoCobroCatalogoResponse getConceptosCobroCatalogo() {
    List<ConceptoCobroResponse> conceptos =
        conceptoCobroRepository.findAllByOrderByCategoriaAscNombreAsc().stream()
            .filter(concepto -> !TesoreriaSupport.CODIGO_FRACCIONAMIENTO.equals(concepto.getCodigo()))
            .map(this::toConceptoResponse)
            .toList();

    long categorias =
        Arrays.stream(pe.cpsp.sistema.tesoreria.domain.model.CategoriaConcepto.values())
            .map(Enum::name)
            .filter(
                categoria ->
                    conceptos.stream().anyMatch(concepto -> categoria.equals(concepto.categoria())))
            .count();

    return new ConceptoCobroCatalogoResponse(
        conceptos,
        conceptoCobroRepository.countByEstado(EstadoConceptoCobro.ACTIVO),
        categorias,
        conceptoCobroRepository.countByEstadoAndAfectaHabilitacion(EstadoConceptoCobro.ACTIVO, true),
        conceptos.stream()
            .filter(concepto -> "DESCUENTO".equals(concepto.tipoConcepto()))
            .count());
  }

  public List<ComprobanteSerieResponse> listSeriesActivas() {
    return comprobanteSerieRepository.findByActivaTrueOrderByTipoAscSerieAsc().stream()
        .map(this::toSerieResponse)
        .toList();
  }

  public HistorialPageResponse getHistorial(
      String search,
      String metodoPago,
      LocalDate fechaEmisionDesde,
      LocalDate fechaEmisionHasta,
      LocalDate fechaPagoDesde,
      LocalDate fechaPagoHasta,
      int page,
      int size) {
    LocalDate today = LocalDate.now(appClock);
    LocalDate sevenDaysAgo = today.minusDays(6);
    List<CajaOperacion> operaciones = loadCajaOperacionesSorted();
    String normalizedSearch = normalize(search);
    String normalizedMethod = normalize(metodoPago);

    Predicate<CajaOperacion> matchesSearch =
        operacion ->
            normalizedSearch.isBlank()
                || List.of(
                        operacion.reference(),
                        operacion.participanteNombre(),
                        operacion.conceptoResumen(),
                        operacion.serie() + "-" + operacion.numeroComprobante(),
                        operacion.tipoComprobante(),
                        operacion.areaCodigo(),
                        operacion.areaNombre(),
                        operacion.generadoPor())
                    .stream()
                    .filter(Objects::nonNull)
                    .map(String::toLowerCase)
                    .anyMatch(value -> value.contains(normalizedSearch));

    Predicate<CajaOperacion> matchesMethod =
        operacion ->
            normalizedMethod.isBlank()
                || "todos".equals(normalizedMethod)
                || normalize(operacion.metodoPago()).equals(normalizedMethod);

    Predicate<CajaOperacion> matchesDates =
        operacion ->
            isWithinRange(operacion.fechaEmision(), fechaEmisionDesde, fechaEmisionHasta)
                && isWithinRange(operacion.fechaPago(), fechaPagoDesde, fechaPagoHasta);

    List<CajaOperacion> filteredOperaciones =
        operaciones.stream().filter(matchesSearch.and(matchesMethod).and(matchesDates)).toList();

    List<OperacionTesoreriaResponse> rows =
        filteredOperaciones.stream().map(this::toOperacionResponse).toList();

    BigDecimal totalHoy =
        filteredOperaciones.stream()
            .filter(operacion -> today.equals(operacion.fechaPago()))
            .map(CajaOperacion::total)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long operacionesHoy =
        filteredOperaciones.stream().filter(operacion -> today.equals(operacion.fechaPago())).count();

    BigDecimal totalUltimosSieteDias =
        filteredOperaciones.stream()
            .filter(operacion -> !operacion.fechaPago().isBefore(sevenDaysAgo))
            .map(CajaOperacion::total)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long operacionesUltimosSieteDias =
        filteredOperaciones.stream()
            .filter(operacion -> !operacion.fechaPago().isBefore(sevenDaysAgo))
            .count();

    BigDecimal ticketPromedio =
        filteredOperaciones.isEmpty()
            ? BigDecimal.ZERO
            : filteredOperaciones.stream()
                .map(CajaOperacion::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(filteredOperaciones.size()), 2, RoundingMode.HALF_UP);

    return new HistorialPageResponse(
        totalHoy,
        operacionesHoy,
        totalUltimosSieteDias,
        operacionesUltimosSieteDias,
        ticketPromedio,
        paginate(rows, page, size));
  }

  public HistorialPageResponse getHistorial(String search, String metodoPago, int page, int size) {
    return getHistorial(search, metodoPago, null, null, null, null, page, size);
  }

  public ComprobantesPageResponse getComprobantes(
      String search,
      String printStatus,
      String tipo,
      LocalDate fechaEmisionDesde,
      LocalDate fechaEmisionHasta,
      LocalDate fechaPagoDesde,
      LocalDate fechaPagoHasta,
      int page,
      int size) {
    List<CajaOperacion> operaciones = loadCajaOperacionesSorted();
    String normalizedSearch = normalize(search);
    String normalizedPrintStatus = normalize(printStatus);
    String normalizedTipo = normalize(tipo);

    List<ComprobanteListadoResponse> rows =
        operaciones.stream()
            .filter(
                operacion ->
                    normalizedSearch.isBlank()
                        || List.of(
                                operacion.reference(),
                                operacion.serie(),
                                String.valueOf(operacion.numeroComprobante()),
                                operacion.participanteNombre(),
                                operacion.tipoComprobante(),
                                operacion.areaCodigo(),
                                operacion.areaNombre(),
                                operacion.generadoPor())
                            .stream()
                            .filter(Objects::nonNull)
                            .map(String::toLowerCase)
                            .anyMatch(value -> value.contains(normalizedSearch)))
            .filter(
                operacion ->
                    normalizedPrintStatus.isBlank()
                        || "todos".equals(normalizedPrintStatus)
                        || ("impreso".equals(normalizedPrintStatus) && operacion.impreso())
                        || ("no impreso".equals(normalizedPrintStatus) && !operacion.impreso()))
            .filter(
                operacion ->
                    normalizedTipo.isBlank()
                        || "todos".equals(normalizedTipo)
                        || operacion.tipoComprobante().equalsIgnoreCase(tipo))
            .filter(
                operacion ->
                    isWithinRange(operacion.fechaEmision(), fechaEmisionDesde, fechaEmisionHasta)
                        && isWithinRange(operacion.fechaPago(), fechaPagoDesde, fechaPagoHasta))
            .map(this::toComprobanteResponse)
            .toList();

    return new ComprobantesPageResponse(
        operaciones.stream().filter(operacion -> operacion.tipoComprobante().equals("BOLETA")).count(),
        operaciones.stream().filter(operacion -> operacion.tipoComprobante().equals("FACTURA")).count(),
        operaciones.stream().filter(operacion -> !operacion.impreso()).count(),
        listSeriesActivas(),
        paginate(rows, page, size));
  }

  public ComprobantesPageResponse getComprobantes(
      String search, String printStatus, String tipo, int page, int size) {
    return getComprobantes(search, printStatus, tipo, null, null, null, null, page, size);
  }

  public FraccionamientosPageResponse getFraccionamientos(String search, int page, int size) {
    List<Fraccionamiento> fraccionamientos = fraccionamientoRepository.findAllWithRelations();
    String normalizedSearch = normalize(search);

    List<FraccionamientoListadoItemResponse> rows =
        fraccionamientos.stream()
            .filter(
                fraccionamiento ->
                    normalizedSearch.isBlank()
                        || List.of(
                                fraccionamiento.getColegiado().getCodigoColegiatura(),
                                buildNombreCompleto(fraccionamiento.getColegiado()))
                            .stream()
                            .filter(Objects::nonNull)
                            .map(String::toLowerCase)
                            .anyMatch(value -> value.contains(normalizedSearch)))
            .sorted(
                Comparator.comparing(
                        (Fraccionamiento fraccionamiento) ->
                            fraccionamiento.getEstado() != EstadoFraccionamiento.ACTIVO)
                    .thenComparing(
                        fraccionamiento -> {
                          FraccionamientoCuota siguienteCuota =
                              tesoreriaSupport.findNextPendingCuota(fraccionamiento);
                          return siguienteCuota != null
                              ? siguienteCuota.getFechaVencimiento()
                              : LocalDate.MAX;
                        })
                    .thenComparing(Comparator.comparing(Fraccionamiento::getId).reversed()))
            .map(this::toFraccionamientoListadoResponse)
            .toList();

    BigDecimal montoTotalRefinanciado =
        fraccionamientos.stream()
            .map(Fraccionamiento::getMontoTotal)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal saldoPendienteTotal =
        fraccionamientos.stream()
            .map(this::calculateSaldoPendiente)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    long conveniosActivos =
        fraccionamientos.stream()
            .filter(
                fraccionamiento -> fraccionamiento.getEstado() == EstadoFraccionamiento.ACTIVO)
            .count();

    return new FraccionamientosPageResponse(
        fraccionamientos.size(),
        conveniosActivos,
        montoTotalRefinanciado,
        saldoPendienteTotal,
        paginate(rows, page, size));
  }

  public FraccionamientoPanelDetailResponse getFraccionamientoDetail(Long fraccionamientoId) {
    Fraccionamiento fraccionamiento =
        fraccionamientoRepository
            .findByIdWithRelations(fraccionamientoId)
            .orElseThrow(
                () -> new ResourceNotFoundException("No existe el fraccionamiento solicitado."));

    return new FraccionamientoPanelDetailResponse(
        fraccionamiento.getId(),
        fraccionamiento.getColegiado().getId(),
        fraccionamiento.getColegiado().getCodigoColegiatura(),
        buildNombreCompleto(fraccionamiento.getColegiado()),
        toFraccionamientoResponse(fraccionamiento));
  }

  private List<Cobro> loadCobrosSorted() {
    return cobroRepository.findAllWithDetails().stream()
        .sorted(Comparator.comparing(Cobro::getFechaEmision).thenComparing(Cobro::getId).reversed())
        .toList();
  }

  private List<InventarioVenta> loadVentasSorted() {
    return inventarioVentaRepository.findAllByOrderByFechaVentaDescIdDesc().stream()
        .sorted(
            Comparator.comparing(InventarioVenta::getFechaVenta)
                .thenComparing(InventarioVenta::getId)
                .reversed())
        .toList();
  }

  private List<CajaOperacion> loadCajaOperacionesSorted() {
    return java.util.stream.Stream.concat(
            loadCobrosSorted().stream().map(this::toCajaOperacion),
            loadVentasSorted().stream().map(this::toCajaOperacion))
        .sorted(
            Comparator.comparing(CajaOperacion::fechaPago)
                .thenComparing(CajaOperacion::fechaEmision)
                .thenComparing(CajaOperacion::id)
                .thenComparing(CajaOperacion::origenOperacion)
                .reversed())
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

    Map<Long, List<Fraccionamiento>> fraccionamientosByColegiado =
        colegiadoRepository.findAll().stream()
            .collect(
                LinkedHashMap::new,
                (map, colegiado) ->
                    map.put(
                        colegiado.getId(),
                        fraccionamientoRepository.findAllByColegiadoIdWithRelations(colegiado.getId())),
                LinkedHashMap::putAll);

    Map<Long, TesoreriaSupport.CobranzaProfile> profiles = new LinkedHashMap<>();
    colegiadoRepository.findAll().forEach(
        colegiado ->
            profiles.put(
                colegiado.getId(),
                tesoreriaSupport.buildProfile(
                    colegiado,
                    cobrosByColegiado.getOrDefault(colegiado.getId(), List.of()),
                    fraccionamientosByColegiado.getOrDefault(colegiado.getId(), List.of()),
                    today,
                    ceremoniaMonto,
                    aportacionMonto)));

    return profiles;
  }

  private List<ResumenCanalResponse> buildResumenCanales(List<CajaOperacion> operaciones, LocalDate today) {
    List<String> paymentMethods = List.of("Efectivo", "Transferencia", "POS/Tarjeta", "Yape/Plin");
    BigDecimal totalDia =
        operaciones.stream()
            .filter(operacion -> today.equals(operacion.fechaPago()))
            .map(CajaOperacion::total)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    return paymentMethods.stream()
        .map(
            method -> {
              List<CajaOperacion> operacionesDelMetodo =
                  operaciones.stream()
                      .filter(operacion -> today.equals(operacion.fechaPago()))
                      .filter(operacion -> method.equals(operacion.metodoPago()))
                      .toList();

              BigDecimal amount =
                  operacionesDelMetodo.stream()
                      .map(CajaOperacion::total)
                      .reduce(BigDecimal.ZERO, BigDecimal::add);

              long percentage =
                  totalDia.compareTo(BigDecimal.ZERO) == 0
                      ? 0
                      : amount.multiply(BigDecimal.valueOf(100))
                          .divide(totalDia, 0, RoundingMode.HALF_UP)
                          .longValue();

              return new ResumenCanalResponse(method, percentage, amount, operacionesDelMetodo.size());
            })
        .toList();
  }

  private List<ResumenCajaResponse> buildEstadoCaja(List<CajaOperacion> operaciones, LocalDate today) {
    List<String> paymentMethods = List.of("Efectivo", "Transferencia", "POS/Tarjeta", "Yape/Plin");
    return paymentMethods.stream()
        .map(
            method -> {
              List<CajaOperacion> operacionesDelMetodo =
                  operaciones.stream()
                      .filter(operacion -> today.equals(operacion.fechaPago()))
                      .filter(operacion -> method.equals(operacion.metodoPago()))
                      .toList();
              BigDecimal amount =
                  operacionesDelMetodo.stream()
                      .map(CajaOperacion::total)
                      .reduce(BigDecimal.ZERO, BigDecimal::add);
              return new ResumenCajaResponse(method, amount, operacionesDelMetodo.size());
            })
        .toList();
  }

  private OperacionTesoreriaResponse toOperacionResponse(CajaOperacion operacion) {
    return new OperacionTesoreriaResponse(
        operacion.id(),
        operacion.reference(),
        operacion.fechaEmision(),
        operacion.fechaPago(),
        operacion.participanteNombre(),
        operacion.conceptoResumen(),
        operacion.metodoPago(),
        operacion.total(),
        operacion.serie(),
        operacion.numeroComprobante(),
        operacion.origenOperacion(),
        operacion.areaCodigo(),
        operacion.areaNombre(),
        operacion.generadoPor(),
        operacion.estado());
  }

  private ComprobanteListadoResponse toComprobanteResponse(CajaOperacion operacion) {
    return new ComprobanteListadoResponse(
        operacion.id(),
        operacion.tipoComprobante(),
        operacion.serie(),
        operacion.numeroComprobante(),
        operacion.participanteNombre(),
        operacion.fechaEmision(),
        operacion.fechaPago(),
        operacion.total(),
        operacion.estado(),
        operacion.origenOperacion(),
        operacion.areaCodigo(),
        operacion.areaNombre(),
        operacion.generadoPor(),
        operacion.impreso());
  }

  private ConceptoCobroResponse toConceptoResponse(ConceptoCobro concepto) {
    return new ConceptoCobroResponse(
        concepto.getId(),
        concepto.getCodigo(),
        concepto.getTipoConcepto().name(),
        concepto.getNombre(),
        concepto.getCategoria().name(),
        concepto.getDescripcion(),
        concepto.getMontoBase(),
        concepto.getTipoDescuento() != null ? concepto.getTipoDescuento().name() : null,
        concepto.getValorDescuento(),
        concepto.getAplicaDescuentoA() != null ? concepto.getAplicaDescuentoA().name() : null,
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

  private FraccionamientoListadoItemResponse toFraccionamientoListadoResponse(
      Fraccionamiento fraccionamiento) {
    FraccionamientoCuota siguienteCuota = tesoreriaSupport.findNextPendingCuota(fraccionamiento);

    return new FraccionamientoListadoItemResponse(
        fraccionamiento.getId(),
        fraccionamiento.getColegiado().getId(),
        fraccionamiento.getColegiado().getCodigoColegiatura(),
        buildNombreCompleto(fraccionamiento.getColegiado()),
        siguienteCuota != null
            ? buildFractionationReference(siguienteCuota, fraccionamiento.getNumeroCuotas())
            : "Convenio cerrado",
        siguienteCuota != null ? siguienteCuota.getFechaVencimiento() : null,
        fraccionamiento.getEstado().name(),
        siguienteCuota != null);
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
        BigDecimal.ZERO,
        List.of(),
        List.of(),
        null);
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

  private String buildFractionationReference(
      FraccionamientoCuota cuota, Integer totalInstallments) {
    if (cuota == null || totalInstallments == null) {
      return "";
    }

    return "Cuota " + cuota.getNumeroCuota() + "/" + totalInstallments;
  }

  private CajaOperacion toCajaOperacion(Cobro cobro) {
    return new CajaOperacion(
        cobro.getId(),
        "TESORERIA",
        tesoreriaSupport.toReference(cobro.getId()),
        cobro.getFechaEmision(),
        cobro.getFechaPago(),
        buildNombreCompleto(cobro.getColegiado()),
        tesoreriaSupport.buildConceptSummary(cobro),
        normalizeMetodoPagoLabel(cobro.getMetodoPago()),
        cobro.getTotal(),
        cobro.getSerie(),
        cobro.getNumeroComprobante(),
        cobro.getEstado(),
        cobro.getTipoComprobante().name(),
        cobro.getAreaCodigo(),
        cobro.getAreaNombre(),
        cobro.getGeneradoPor(),
        cobro.isImpreso());
  }

  private CajaOperacion toCajaOperacion(InventarioVenta venta) {
    return new CajaOperacion(
        venta.getId(),
        "VENTA_PRODUCTO",
        venta.getReferencia(),
        venta.getFechaVenta(),
        venta.getFechaVenta(),
        venta.getClienteNombre(),
        buildVentaConceptSummary(venta),
        venta.getMetodoPago(),
        venta.getTotal(),
        venta.getSerie(),
        venta.getNumeroComprobante(),
        "EMITIDO",
        "BOLETA",
        "002",
        "Inventario",
        "Sistema Inventario",
        venta.isImpreso());
  }

  private String buildVentaConceptSummary(InventarioVenta venta) {
    List<String> nombres =
        venta.getDetalles().stream()
            .map(InventarioVentaDetalle::getProducto)
            .filter(Objects::nonNull)
            .map(producto -> producto.getNombre())
            .filter(Objects::nonNull)
            .distinct()
            .limit(2)
            .toList();

    if (nombres.isEmpty()) {
      return "Venta de productos";
    }

    return "Venta de productos · " + String.join(" + ", nombres);
  }

  private BigDecimal calculateSaldoPendiente(Fraccionamiento fraccionamiento) {
    return fraccionamiento.getCuotas().stream()
        .filter(cuota -> cuota.getEstado() == EstadoFraccionamientoCuota.PENDIENTE)
        .map(FraccionamientoCuota::getMonto)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  private String normalize(String value) {
    return value == null ? "" : value.trim().toLowerCase();
  }

  private boolean isWithinRange(LocalDate value, LocalDate from, LocalDate to) {
    if (value == null) {
      return false;
    }

    return (from == null || !value.isBefore(from)) && (to == null || !value.isAfter(to));
  }

  public String normalizeMetodoPagoLabel(MetodoPago metodoPago) {
    return switch (metodoPago) {
      case EFECTIVO -> "Efectivo";
      case YAPE_PLIN -> "Yape/Plin";
      case TRANSFERENCIA -> "Transferencia";
      case POS_TARJETA -> "POS/Tarjeta";
    };
  }

  private FraccionamientoDetailResponse toFraccionamientoResponse(Fraccionamiento fraccionamiento) {
    if (fraccionamiento == null) {
      return null;
    }

    List<FraccionamientoCuotaResponse> cuotas =
        fraccionamiento.getCuotas().stream()
            .sorted(Comparator.comparing(FraccionamientoCuota::getNumeroCuota))
            .map(this::toCuotaResponse)
            .toList();

    FraccionamientoCuota siguienteCuota = tesoreriaSupport.findNextPendingCuota(fraccionamiento);
    BigDecimal saldoPendiente =
        fraccionamiento.getCuotas().stream()
            .filter(cuota -> cuota.getEstado() == EstadoFraccionamientoCuota.PENDIENTE)
            .map(FraccionamientoCuota::getMonto)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    int cuotasPagadas =
        (int)
            fraccionamiento.getCuotas().stream()
                .filter(cuota -> cuota.getEstado() == EstadoFraccionamientoCuota.PAGADA)
                .count();

    return new FraccionamientoDetailResponse(
        fraccionamiento.getId(),
        fraccionamiento.getEstado().name(),
        fraccionamiento.getMontoTotal(),
        saldoPendiente,
        fraccionamiento.getNumeroCuotas(),
        cuotasPagadas,
        fraccionamiento.getNumeroCuotas() - cuotasPagadas,
        fraccionamiento.getFechaInicio(),
        fraccionamiento.getObservacion(),
        fraccionamiento.getPeriodos().stream()
            .map(periodo -> periodo.getPeriodoReferencia())
            .sorted()
            .toList(),
        cuotas,
        siguienteCuota != null ? toCuotaResponse(siguienteCuota) : null);
  }

  private FraccionamientoCuotaResponse toCuotaResponse(FraccionamientoCuota cuota) {
    return new FraccionamientoCuotaResponse(
        cuota.getId(),
        cuota.getNumeroCuota(),
        cuota.getMonto(),
        cuota.getFechaVencimiento(),
        cuota.getEstado().name(),
        cuota.getEstado() == EstadoFraccionamientoCuota.PAGADA);
  }

  private record CajaOperacion(
      Long id,
      String origenOperacion,
      String reference,
      LocalDate fechaEmision,
      LocalDate fechaPago,
      String participanteNombre,
      String conceptoResumen,
      String metodoPago,
      BigDecimal total,
      String serie,
      Long numeroComprobante,
      String estado,
      String tipoComprobante,
      String areaCodigo,
      String areaNombre,
      String generadoPor,
      boolean impreso) {}
}
