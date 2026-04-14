package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.tesoreria.api.dto.CobroItemResponse;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroItemRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroResponse;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;
import pe.cpsp.sistema.tesoreria.domain.model.ConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.MetodoPago;
import pe.cpsp.sistema.tesoreria.domain.model.TipoComprobante;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ComprobanteSerieRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ConceptoCobroRepository;

@Service
@Transactional
public class TesoreriaCobroService {

  private final ColegiadoRepository colegiadoRepository;
  private final CobroRepository cobroRepository;
  private final ConceptoCobroRepository conceptoCobroRepository;
  private final ComprobanteSerieRepository comprobanteSerieRepository;
  private final TesoreriaSupport tesoreriaSupport;
  private final Clock appClock;

  public TesoreriaCobroService(
      ColegiadoRepository colegiadoRepository,
      CobroRepository cobroRepository,
      ConceptoCobroRepository conceptoCobroRepository,
      ComprobanteSerieRepository comprobanteSerieRepository,
      TesoreriaSupport tesoreriaSupport,
      Clock appClock) {
    this.colegiadoRepository = colegiadoRepository;
    this.cobroRepository = cobroRepository;
    this.conceptoCobroRepository = conceptoCobroRepository;
    this.comprobanteSerieRepository = comprobanteSerieRepository;
    this.tesoreriaSupport = tesoreriaSupport;
    this.appClock = appClock;
  }

  public RegistrarCobroResponse registrarCobro(RegistrarCobroRequest request) {
    Colegiado colegiado =
        colegiadoRepository
            .findById(request.colegiadoId())
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado indicado."));

    TipoComprobante tipoComprobante = parseTipoComprobante(request.tipoComprobante());
    MetodoPago metodoPago = parseMetodoPago(request.metodoPago());

    if (tipoComprobante == TipoComprobante.FACTURA
        && (colegiado.getRuc() == null || colegiado.getRuc().isBlank())) {
      throw new InvalidRequestException("El colegiado debe tener RUC registrado para emitir factura.");
    }

    ConceptoCobro ceremoniaConcept =
        conceptoCobroRepository
            .findByCodigo(TesoreriaSupport.CODIGO_CEREMONIA)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto ceremonia."));
    ConceptoCobro aportacionConcept =
        conceptoCobroRepository
            .findByCodigo(TesoreriaSupport.CODIGO_APORTACION_MENSUAL)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto de aportacion."));

    List<Cobro> memberCobros =
        cobroRepository.findAllWithDetails().stream()
            .filter(cobro -> Objects.equals(cobro.getColegiado().getId(), colegiado.getId()))
            .toList();

    LocalDate calculationDate = request.fechaEmision() != null ? request.fechaEmision() : LocalDate.now(appClock);
    TesoreriaSupport.CobranzaProfile profile =
        tesoreriaSupport.buildProfile(
            colegiado,
            memberCobros,
            calculationDate,
            ceremoniaConcept.getMontoBase(),
            aportacionConcept.getMontoBase());

    validateItems(request.items(), profile);

    ComprobanteSerie serie =
        comprobanteSerieRepository
            .findByTipoAndActivaTrue(tipoComprobante)
            .orElseThrow(() -> new ResourceNotFoundException("No existe una serie activa para el comprobante."));

    Cobro cobro = new Cobro();
    cobro.setColegiado(colegiado);
    cobro.setTipoComprobante(tipoComprobante);
    cobro.setSerie(serie.getSerie());
    cobro.setNumeroComprobante(serie.getCorrelativoActual() + 1);
    cobro.setOrigen("CAJA");
    cobro.setMetodoPago(metodoPago);
    cobro.setFechaEmision(calculationDate);
    cobro.setObservacion(cleanNullable(request.observacion()));
    cobro.setEstado("EMITIDO");
    cobro.setImpreso(false);

    BigDecimal subtotal = BigDecimal.ZERO;
    BigDecimal descuentoTotal = BigDecimal.ZERO;
    BigDecimal moraTotal = BigDecimal.ZERO;

    List<CobroDetalle> detalles = new ArrayList<>();
    for (RegistrarCobroItemRequest itemRequest : request.items()) {
      ConceptoCobro concepto =
          conceptoCobroRepository
              .findById(itemRequest.conceptoCobroId())
              .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto seleccionado."));

      if (concepto.getEstado() != EstadoConceptoCobro.ACTIVO) {
        throw new InvalidRequestException("Solo se pueden registrar conceptos activos.");
      }

      if (concepto.isUsaPeriodo()) {
        validateMonthlyItem(concepto, itemRequest, profile);
      }

      if (TesoreriaSupport.CODIGO_CEREMONIA.equals(concepto.getCodigo()) && !profile.ceremoniaPendiente()) {
        throw new InvalidRequestException("La ceremonia de colegiatura ya fue pagada.");
      }

      BigDecimal gross =
          concepto.getMontoBase().multiply(BigDecimal.valueOf(itemRequest.cantidad().longValue()));
      BigDecimal lineTotal = gross.subtract(itemRequest.descuento()).add(itemRequest.mora());

      CobroDetalle detalle = new CobroDetalle();
      detalle.setCobro(cobro);
      detalle.setConceptoCobro(concepto);
      detalle.setPeriodoReferencia(cleanNullable(itemRequest.periodoReferencia()));
      detalle.setCantidad(itemRequest.cantidad());
      detalle.setMontoUnitario(concepto.getMontoBase());
      detalle.setDescuento(itemRequest.descuento());
      detalle.setMora(itemRequest.mora());
      detalle.setTotalLinea(lineTotal);
      detalles.add(detalle);

      subtotal = subtotal.add(gross);
      descuentoTotal = descuentoTotal.add(itemRequest.descuento());
      moraTotal = moraTotal.add(itemRequest.mora());
    }

    cobro.setSubtotal(subtotal);
    cobro.setDescuentoTotal(descuentoTotal);
    cobro.setMoraTotal(moraTotal);
    cobro.setTotal(subtotal.subtract(descuentoTotal).add(moraTotal));
    cobro.setDetalles(detalles);

    Cobro saved = cobroRepository.save(cobro);
    serie.setCorrelativoActual(saved.getNumeroComprobante());
    comprobanteSerieRepository.save(serie);

    return new RegistrarCobroResponse(
        saved.getId(),
        buildNombreCompleto(colegiado),
        colegiado.getCodigoColegiatura(),
        colegiado.getDni(),
        saved.getTipoComprobante().name(),
        saved.getSerie(),
        saved.getNumeroComprobante(),
        saved.getFechaEmision(),
        normalizeMetodoPagoLabel(saved.getMetodoPago()),
        saved.getObservacion(),
        saved.getSubtotal(),
        saved.getDescuentoTotal(),
        saved.getMoraTotal(),
        saved.getTotal(),
        saved.isImpreso(),
        saved.getDetalles().stream()
            .map(
                detalle ->
                    new CobroItemResponse(
                        detalle.getConceptoCobro().getNombre(),
                        detalle.getConceptoCobro().getCodigo(),
                        detalle.getPeriodoReferencia(),
                        detalle.getCantidad(),
                        detalle.getMontoUnitario(),
                        detalle.getDescuento(),
                        detalle.getMora(),
                        detalle.getTotalLinea()))
            .toList());
  }

  public void marcarImpreso(Long cobroId) {
    Cobro cobro =
        cobroRepository
            .findById(cobroId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el cobro indicado."));
    cobro.setImpreso(true);
    cobroRepository.save(cobro);
  }

  private void validateItems(
      List<RegistrarCobroItemRequest> items, TesoreriaSupport.CobranzaProfile profile) {
    Set<String> monthlyPeriods = new HashSet<>();
    boolean containsCeremony =
        items.stream()
            .map(RegistrarCobroItemRequest::conceptoCobroId)
            .map(conceptoCobroRepository::findById)
            .flatMap(Optional::stream)
            .anyMatch(concept -> TesoreriaSupport.CODIGO_CEREMONIA.equals(concept.getCodigo()));

    if (profile.ceremoniaPendiente()) {
      boolean containsMonthly =
          items.stream()
              .map(RegistrarCobroItemRequest::conceptoCobroId)
              .map(conceptoCobroRepository::findById)
              .flatMap(Optional::stream)
              .anyMatch(concept -> TesoreriaSupport.CODIGO_APORTACION_MENSUAL.equals(concept.getCodigo()));

      if (containsMonthly) {
        throw new InvalidRequestException(
            "Debe registrar primero el pago de ceremonia antes de cobrar aportaciones mensuales.");
      }
    }

    for (RegistrarCobroItemRequest item : items) {
      ConceptoCobro concepto =
          conceptoCobroRepository
              .findById(item.conceptoCobroId())
              .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto seleccionado."));

      if (TesoreriaSupport.CODIGO_CEREMONIA.equals(concepto.getCodigo()) && containsCeremony && item.cantidad() > 1) {
        throw new InvalidRequestException("La ceremonia solo puede registrarse una vez por cobro.");
      }

      if (TesoreriaSupport.CODIGO_APORTACION_MENSUAL.equals(concepto.getCodigo())) {
        String period = clean(item.periodoReferencia());
        if (!monthlyPeriods.add(period)) {
          throw new InvalidRequestException("No se puede repetir el mismo periodo mensual en un cobro.");
        }
      }
    }
  }

  private void validateMonthlyItem(
      ConceptoCobro concepto,
      RegistrarCobroItemRequest itemRequest,
      TesoreriaSupport.CobranzaProfile profile) {
    String periodo = clean(itemRequest.periodoReferencia());
    if (!TesoreriaSupport.CODIGO_APORTACION_MENSUAL.equals(concepto.getCodigo())) {
      return;
    }

    if (!periodo.matches("\\d{4}-\\d{2}")) {
      throw new InvalidRequestException("La aportacion mensual requiere un periodo valido YYYY-MM.");
    }

    if (itemRequest.cantidad() != 1) {
      throw new InvalidRequestException("Cada aportacion mensual debe registrarse con cantidad 1.");
    }

    boolean selectable =
        profile.periodosMensuales().stream()
            .filter(period -> period.period().equals(YearMonth.parse(periodo)))
            .findFirst()
            .map(TesoreriaSupport.PeriodoCobranza::selectable)
            .orElse(false);

    if (!selectable) {
      throw new InvalidRequestException("El periodo seleccionado no esta disponible para cobro.");
    }
  }

  private TipoComprobante parseTipoComprobante(String value) {
    try {
      return TipoComprobante.valueOf(clean(value).toUpperCase());
    } catch (RuntimeException error) {
      throw new InvalidRequestException("Tipo de comprobante no valido.");
    }
  }

  private MetodoPago parseMetodoPago(String value) {
    return switch (clean(value).toUpperCase()) {
      case "EFECTIVO" -> MetodoPago.EFECTIVO;
      case "YAPE/PLIN", "YAPE_PLIN" -> MetodoPago.YAPE_PLIN;
      case "TRANSFERENCIA" -> MetodoPago.TRANSFERENCIA;
      case "POS/TARJETA", "POS_TARJETA" -> MetodoPago.POS_TARJETA;
      default -> throw new InvalidRequestException("Metodo de pago no valido.");
    };
  }

  private String normalizeMetodoPagoLabel(MetodoPago metodoPago) {
    return switch (metodoPago) {
      case EFECTIVO -> "Efectivo";
      case YAPE_PLIN -> "Yape/Plin";
      case TRANSFERENCIA -> "Transferencia";
      case POS_TARJETA -> "POS/Tarjeta";
    };
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

  private String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private String cleanNullable(String value) {
    String cleaned = clean(value);
    return cleaned.isBlank() ? null : cleaned;
  }
}
