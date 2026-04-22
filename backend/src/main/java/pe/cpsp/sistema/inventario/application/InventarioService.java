package pe.cpsp.sistema.inventario.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.domain.model.PersonaExterna;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.PersonaExternaRepository;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.inventario.api.dto.InventarioClienteVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioDashboardResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioEntregaMemberResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioMovimientoResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoCreateRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoListItemResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaItemRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaItemResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaListItemResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentasPanelResponse;
import pe.cpsp.sistema.inventario.domain.model.InventarioEntrega;
import pe.cpsp.sistema.inventario.domain.model.InventarioMovimiento;
import pe.cpsp.sistema.inventario.domain.model.InventarioProducto;
import pe.cpsp.sistema.inventario.domain.model.InventarioVenta;
import pe.cpsp.sistema.inventario.domain.model.InventarioVentaDetalle;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioEntregaRepository;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioMovimientoRepository;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioProductoRepository;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioVentaRepository;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;
import pe.cpsp.sistema.tesoreria.domain.model.TipoComprobante;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ComprobanteSerieRepository;

@Service
@Transactional
public class InventarioService {

  private static final String ESTADO_HABILITADO = "HABILITADO";
  private static final String TIPO_VENTA = "VENTA";
  private static final String CLIENTE_TIPO_COLEGIADO = "COLEGIADO";
  private static final String CLIENTE_TIPO_EXTERNO = "EXTERNO";

  private final InventarioProductoRepository inventarioProductoRepository;
  private final InventarioEntregaRepository inventarioEntregaRepository;
  private final InventarioMovimientoRepository inventarioMovimientoRepository;
  private final InventarioVentaRepository inventarioVentaRepository;
  private final ColegiadoRepository colegiadoRepository;
  private final PersonaExternaRepository personaExternaRepository;
  private final ColegiadoService colegiadoService;
  private final ComprobanteSerieRepository comprobanteSerieRepository;

  public InventarioService(
      InventarioProductoRepository inventarioProductoRepository,
      InventarioEntregaRepository inventarioEntregaRepository,
      InventarioMovimientoRepository inventarioMovimientoRepository,
      InventarioVentaRepository inventarioVentaRepository,
      ColegiadoRepository colegiadoRepository,
      PersonaExternaRepository personaExternaRepository,
      ColegiadoService colegiadoService,
      ComprobanteSerieRepository comprobanteSerieRepository) {
    this.inventarioProductoRepository = inventarioProductoRepository;
    this.inventarioEntregaRepository = inventarioEntregaRepository;
    this.inventarioMovimientoRepository = inventarioMovimientoRepository;
    this.inventarioVentaRepository = inventarioVentaRepository;
    this.colegiadoRepository = colegiadoRepository;
    this.personaExternaRepository = personaExternaRepository;
    this.colegiadoService = colegiadoService;
    this.comprobanteSerieRepository = comprobanteSerieRepository;
  }

  @Transactional(readOnly = true)
  public InventarioDashboardResponse getDashboard() {
    List<InventarioProductoListItemResponse> productos =
        inventarioProductoRepository.findAllByActivoTrueOrderByNombreAsc().stream()
            .map(this::toListItem)
            .toList();

    List<InventarioMovimientoResponse> movimientos =
        inventarioMovimientoRepository.findTop5ByOrderByFechaMovimientoDesc().stream()
            .map(this::toMovimientoResponse)
            .toList();

    return new InventarioDashboardResponse(productos, movimientos);
  }

  @Transactional(readOnly = true)
  public InventarioProductoDetailResponse getProductoDetail(Long productoId) {
    InventarioProducto producto = findProducto(productoId);
    return toDetail(producto);
  }

  @Transactional(readOnly = true)
  public List<InventarioClienteVentaResponse> listClientesVenta() {
    List<InventarioClienteVentaResponse> clientes = new ArrayList<>();

    clientes.addAll(
        colegiadoService.listAll().stream()
            .map(
                colegiado ->
                    new InventarioClienteVentaResponse(
                        colegiado.id(),
                        CLIENTE_TIPO_COLEGIADO,
                        colegiado.codigoColegiatura(),
                        colegiado.nombreCompleto(),
                        colegiado.dni(),
                        "Colegiado " + formatEstadoLabel(colegiado.estado())))
            .toList());

    clientes.addAll(
        personaExternaRepository.findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc().stream()
            .map(
                externo ->
                    new InventarioClienteVentaResponse(
                        externo.getId(),
                        CLIENTE_TIPO_EXTERNO,
                        externo.getCodigoExterno(),
                        buildNombreCompleto(externo),
                        externo.getDni(),
                        externo.getTipoExterno()))
            .toList());

    return clientes.stream()
        .sorted(Comparator.comparing(InventarioClienteVentaResponse::nombreCompleto))
        .toList();
  }

  @Transactional(readOnly = true)
  public InventarioVentasPanelResponse getVentasPanel() {
    List<InventarioVenta> ventas = inventarioVentaRepository.findAllByOrderByFechaVentaDescIdDesc();

    BigDecimal montoRecaudado =
        ventas.stream().map(InventarioVenta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
    long unidadesVendidas =
        ventas.stream()
            .flatMap(venta -> venta.getDetalles().stream())
            .mapToLong(InventarioVentaDetalle::getCantidad)
            .sum();
    BigDecimal ticketPromedio =
        ventas.isEmpty()
            ? BigDecimal.ZERO
            : montoRecaudado.divide(BigDecimal.valueOf(ventas.size()), 2, RoundingMode.HALF_UP);

    return new InventarioVentasPanelResponse(
        ventas.size(),
        unidadesVendidas,
        montoRecaudado,
        ticketPromedio,
        ventas.stream().map(this::toVentaListItem).toList());
  }

  @Transactional(readOnly = true)
  public InventarioVentaResponse getVenta(Long ventaId) {
    InventarioVenta venta =
        inventarioVentaRepository
            .findByIdWithDetails(ventaId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe la venta solicitada."));
    return toVentaResponse(venta);
  }

  public InventarioProductoListItemResponse crearProducto(InventarioProductoCreateRequest request) {
    String normalizedCode = request.codigo().trim().toUpperCase();

    if (inventarioProductoRepository.existsByCodigoIgnoreCase(normalizedCode)) {
      throw new DuplicateResourceException("Ya existe un producto con ese codigo.");
    }

    InventarioProducto producto = new InventarioProducto();
    producto.setCodigo(normalizedCode);
    producto.setNombre(request.nombre().trim());
    producto.setCategoria(request.categoria().trim());
    producto.setDescripcion(
        request.descripcion() == null || request.descripcion().isBlank()
            ? null
            : request.descripcion().trim());
    producto.setPrecioReferencia(request.precioReferencia());
    producto.setStockActual(request.stockInicial());
    producto.setActivo(true);

    InventarioProducto savedProduct = inventarioProductoRepository.save(producto);

    if (request.stockInicial() > 0) {
      registrarMovimiento(
          savedProduct,
          "INGRESO",
          "Stock inicial registrado al crear el producto",
          request.stockInicial());
    }

    return toListItem(savedProduct);
  }

  public InventarioVentaResponse registrarVenta(InventarioRegistrarVentaRequest request) {
    ClienteVentaSnapshot cliente = resolveCliente(request.clienteTipo(), request.clienteId());
    String metodoPago = normalizeMetodoPago(request.metodoPago());
    ComprobanteSerie serie =
        comprobanteSerieRepository
            .findByTipoAndActivaTrue(TipoComprobante.BOLETA)
            .orElseThrow(() -> new ResourceNotFoundException("No existe una serie activa para boleta."));

    validateVentaItems(request.items());

    Map<Long, InventarioProducto> productosPorId = new HashMap<>();
    for (InventarioRegistrarVentaItemRequest item : request.items()) {
      InventarioProducto producto = findProducto(item.productoId());
      productosPorId.put(producto.getId(), producto);
    }

    for (InventarioRegistrarVentaItemRequest item : request.items()) {
      InventarioProducto producto = productosPorId.get(item.productoId());
      if (producto.getStockActual() < item.cantidad()) {
        throw new InvalidRequestException(
            "No hay stock suficiente para vender " + producto.getNombre() + ".");
      }
    }

    InventarioVenta venta = new InventarioVenta();
    venta.setSerie(serie.getSerie());
    venta.setNumeroComprobante(serie.getCorrelativoActual() + 1);
    venta.setReferencia(buildVentaReference(venta.getSerie(), venta.getNumeroComprobante()));
    venta.setClienteTipo(cliente.tipo());
    venta.setClienteReferenciaId(cliente.id());
    venta.setClienteCodigo(cliente.codigo());
    venta.setClienteNombre(cliente.nombre());
    venta.setClienteDocumento(cliente.documento());
    venta.setClienteDetalle(cliente.detalle());
    venta.setMetodoPago(metodoPago);
    venta.setFechaVenta(request.fechaVenta());
    venta.setObservacion(cleanNullable(request.observacion()));
    venta.setImpreso(false);

    BigDecimal total = BigDecimal.ZERO;
    List<InventarioVentaDetalle> detalles = new ArrayList<>();
    for (InventarioRegistrarVentaItemRequest item : request.items()) {
      InventarioProducto producto = productosPorId.get(item.productoId());
      BigDecimal precioUnitario = producto.getPrecioReferencia();
      BigDecimal totalLinea = precioUnitario.multiply(BigDecimal.valueOf(item.cantidad()));

      InventarioVentaDetalle detalle = new InventarioVentaDetalle();
      detalle.setVenta(venta);
      detalle.setProducto(producto);
      detalle.setCantidad(item.cantidad());
      detalle.setPrecioUnitario(precioUnitario);
      detalle.setTotalLinea(totalLinea);
      detalles.add(detalle);

      producto.setStockActual(producto.getStockActual() - item.cantidad());
      inventarioProductoRepository.save(producto);
      registrarMovimiento(producto, TIPO_VENTA, "Venta a " + cliente.nombre(), -item.cantidad());

      total = total.add(totalLinea);
    }

    venta.setDetalles(detalles);
    venta.setTotal(total);

    InventarioVenta savedVenta = inventarioVentaRepository.save(venta);
    serie.setCorrelativoActual(savedVenta.getNumeroComprobante());
    comprobanteSerieRepository.save(serie);

    return toVentaResponse(savedVenta);
  }

  public void marcarVentaImpresa(Long ventaId) {
    InventarioVenta venta =
        inventarioVentaRepository
            .findByIdWithDetails(ventaId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe la venta solicitada."));
    venta.setImpreso(true);
    inventarioVentaRepository.save(venta);
  }

  public InventarioProductoDetailResponse registrarEntrega(Long productoId, Long colegiadoId) {
    InventarioProducto producto = findProducto(productoId);
    Colegiado colegiado = findColegiado(colegiadoId);
    ColegiadoResponse colegiadoEstado = colegiadoService.getById(colegiadoId);

    if (!ESTADO_HABILITADO.equals(colegiadoEstado.estado())) {
      throw new InvalidRequestException(
          "Solo los colegiados habilitados pueden recibir productos del inventario.");
    }

    if (inventarioEntregaRepository.findByProductoIdAndColegiadoId(productoId, colegiadoId).isPresent()) {
      return getProductoDetail(productoId);
    }

    if (producto.getStockActual() <= 0) {
      throw new InvalidRequestException("No hay stock disponible para entregar este producto.");
    }

    InventarioEntrega entrega = new InventarioEntrega();
    entrega.setProducto(producto);
    entrega.setColegiado(colegiado);
    inventarioEntregaRepository.save(entrega);
    producto.getEntregas().add(entrega);

    producto.setStockActual(producto.getStockActual() - 1);
    inventarioProductoRepository.save(producto);

    registrarMovimiento(
        producto,
        "ENTREGA",
        "Entrega confirmada a " + colegiadoEstado.nombreCompleto(),
        -1);

    return getProductoDetail(productoId);
  }

  public InventarioProductoDetailResponse quitarEntrega(Long productoId, Long colegiadoId) {
    InventarioProducto producto = findProducto(productoId);
    findColegiado(colegiadoId);

    inventarioEntregaRepository
        .findByProductoIdAndColegiadoId(productoId, colegiadoId)
        .ifPresent(
            entrega -> {
              inventarioEntregaRepository.delete(entrega);
              producto.getEntregas().removeIf(item -> item.getId().equals(entrega.getId()));
              producto.setStockActual(producto.getStockActual() + 1);
              inventarioProductoRepository.save(producto);
              registrarMovimiento(
                  producto,
                  "REVERSA_ENTREGA",
                  "Reversion de entrega de " + buildNombreCompleto(entrega.getColegiado()),
                  1);
            });

    return getProductoDetail(productoId);
  }

  private void validateVentaItems(List<InventarioRegistrarVentaItemRequest> items) {
    Set<Long> productos = new HashSet<>();
    for (InventarioRegistrarVentaItemRequest item : items) {
      if (!productos.add(item.productoId())) {
        throw new InvalidRequestException("No se puede repetir el mismo producto en una venta.");
      }
    }
  }

  private ClienteVentaSnapshot resolveCliente(String clienteTipo, Long clienteId) {
    String normalizedType = clean(clienteTipo).toUpperCase();

    if (CLIENTE_TIPO_COLEGIADO.equals(normalizedType)) {
      ColegiadoResponse colegiado = colegiadoService.getById(clienteId);
      return new ClienteVentaSnapshot(
          CLIENTE_TIPO_COLEGIADO,
          colegiado.id(),
          colegiado.codigoColegiatura(),
          colegiado.nombreCompleto(),
          colegiado.dni(),
          "Colegiado " + formatEstadoLabel(colegiado.estado()));
    }

    if (CLIENTE_TIPO_EXTERNO.equals(normalizedType)) {
      PersonaExterna externo =
          personaExternaRepository
              .findById(clienteId)
              .orElseThrow(
                  () -> new ResourceNotFoundException("No existe el externo solicitado."));
      return new ClienteVentaSnapshot(
          CLIENTE_TIPO_EXTERNO,
          externo.getId(),
          externo.getCodigoExterno(),
          buildNombreCompleto(externo),
          externo.getDni(),
          externo.getTipoExterno());
    }

    throw new InvalidRequestException("Tipo de cliente no valido para la venta.");
  }

  private InventarioProducto findProducto(Long productoId) {
    return inventarioProductoRepository
        .findByIdAndActivoTrue(productoId)
        .orElseThrow(() -> new ResourceNotFoundException("No existe el producto solicitado."));
  }

  private Colegiado findColegiado(Long colegiadoId) {
    return colegiadoRepository
        .findById(colegiadoId)
        .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));
  }

  private String buildNombreCompleto(Colegiado colegiado) {
    return String.join(
            " ",
            colegiado.getNombre(),
            colegiado.getApellidoPaterno(),
            colegiado.getApellidoMaterno())
        .trim();
  }

  private String buildNombreCompleto(PersonaExterna personaExterna) {
    return String.join(
            " ",
            clean(personaExterna.getNombre()),
            clean(personaExterna.getApellidoPaterno()),
            clean(personaExterna.getApellidoMaterno()))
        .trim();
  }

  private void registrarMovimiento(
      InventarioProducto producto, String tipo, String detalle, int cantidad) {
    InventarioMovimiento movimiento = new InventarioMovimiento();
    movimiento.setProducto(producto);
    movimiento.setTipo(tipo);
    movimiento.setDetalle(detalle);
    movimiento.setCantidad(cantidad);
    movimiento.setFechaMovimiento(LocalDateTime.now());
    inventarioMovimientoRepository.save(movimiento);
  }

  private InventarioProductoListItemResponse toListItem(InventarioProducto producto) {
    return new InventarioProductoListItemResponse(
        producto.getId(),
        producto.getCodigo(),
        producto.getNombre(),
        producto.getCategoria(),
        producto.getDescripcion(),
        producto.getPrecioReferencia(),
        producto.getStockActual(),
        producto.getEntregas().size(),
        inventarioMovimientoRepository.sumAbsoluteCantidadByProductoIdAndTipo(producto.getId(), TIPO_VENTA));
  }

  private InventarioProductoDetailResponse toDetail(InventarioProducto producto) {
    Set<Long> deliveredIds =
        producto.getEntregas().stream()
            .map(entrega -> entrega.getColegiado().getId())
            .collect(Collectors.toSet());

    List<InventarioEntregaMemberResponse> colegiados =
        colegiadoService.listAll().stream()
            .map(colegiado -> toEntregaMember(colegiado, deliveredIds.contains(colegiado.id())))
            .toList();

    return new InventarioProductoDetailResponse(
        producto.getId(),
        producto.getCodigo(),
        producto.getNombre(),
        producto.getCategoria(),
        producto.getDescripcion(),
        producto.getPrecioReferencia(),
        producto.getStockActual(),
        deliveredIds.size(),
        inventarioMovimientoRepository.sumAbsoluteCantidadByProductoIdAndTipo(producto.getId(), TIPO_VENTA),
        colegiados);
  }

  private InventarioEntregaMemberResponse toEntregaMember(
      ColegiadoResponse colegiado, boolean entregado) {
    boolean habilitado = ESTADO_HABILITADO.equals(colegiado.estado());

    return new InventarioEntregaMemberResponse(
        colegiado.id(),
        colegiado.codigoColegiatura(),
        colegiado.nombreCompleto(),
        colegiado.especialidades().isEmpty()
            ? "Sin especialidad registrada"
            : String.join(", ", colegiado.especialidades()),
        colegiado.estado(),
        habilitado,
        entregado);
  }

  private InventarioMovimientoResponse toMovimientoResponse(InventarioMovimiento movimiento) {
    return new InventarioMovimientoResponse(
        movimiento.getId(),
        movimiento.getProducto().getId(),
        movimiento.getProducto().getNombre(),
        movimiento.getTipo(),
        movimiento.getDetalle(),
        movimiento.getCantidad(),
        movimiento.getFechaMovimiento());
  }

  private InventarioVentaResponse toVentaResponse(InventarioVenta venta) {
    return new InventarioVentaResponse(
        venta.getId(),
        venta.getReferencia(),
        TipoComprobante.BOLETA.name(),
        venta.getSerie(),
        venta.getNumeroComprobante(),
        venta.getClienteTipo(),
        venta.getClienteCodigo(),
        venta.getClienteNombre(),
        venta.getClienteDocumento(),
        venta.getClienteDetalle(),
        venta.getMetodoPago(),
        venta.getFechaVenta(),
        venta.getObservacion(),
        venta.getTotal(),
        venta.isImpreso(),
        venta.getDetalles().stream()
            .map(
                detalle ->
                    new InventarioVentaItemResponse(
                        detalle.getProducto().getId(),
                        detalle.getProducto().getCodigo(),
                        detalle.getProducto().getNombre(),
                        detalle.getCantidad(),
                        detalle.getPrecioUnitario(),
                        detalle.getTotalLinea()))
            .toList());
  }

  private InventarioVentaListItemResponse toVentaListItem(InventarioVenta venta) {
    int totalUnidades =
        venta.getDetalles().stream().mapToInt(InventarioVentaDetalle::getCantidad).sum();

    return new InventarioVentaListItemResponse(
        venta.getId(),
        venta.getReferencia(),
        venta.getClienteTipo(),
        venta.getClienteCodigo(),
        venta.getClienteNombre(),
        venta.getClienteDetalle(),
        buildResumenItems(venta),
        totalUnidades,
        venta.getMetodoPago(),
        venta.getFechaVenta(),
        venta.getTotal());
  }

  private String buildResumenItems(InventarioVenta venta) {
    List<String> nombres =
        venta.getDetalles().stream().map(detalle -> detalle.getProducto().getNombre()).distinct().toList();

    if (nombres.isEmpty()) {
      return "Sin items";
    }

    if (nombres.size() == 1) {
      return nombres.get(0);
    }

    return nombres.get(0) + " +" + (nombres.size() - 1) + " item(s)";
  }

  private String buildVentaReference(String serie, Long numeroComprobante) {
    return serie + "-" + String.format("%07d", numeroComprobante);
  }

  private String formatEstadoLabel(String estado) {
    return ESTADO_HABILITADO.equalsIgnoreCase(clean(estado)) ? "habilitado" : "no habilitado";
  }

  private String normalizeMetodoPago(String value) {
    return switch (clean(value).toUpperCase()) {
      case "EFECTIVO" -> "Efectivo";
      case "YAPE/PLIN", "YAPE_PLIN" -> "Yape/Plin";
      case "TRANSFERENCIA" -> "Transferencia";
      case "POS/TARJETA", "POS_TARJETA" -> "POS/Tarjeta";
      default -> throw new InvalidRequestException("Metodo de pago no valido para la venta.");
    };
  }

  private String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private String cleanNullable(String value) {
    String cleaned = clean(value);
    return cleaned.isBlank() ? null : cleaned;
  }

  private record ClienteVentaSnapshot(
      String tipo,
      Long id,
      String codigo,
      String nombre,
      String documento,
      String detalle) {}
}
