package pe.cpsp.sistema.inventario.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.inventario.api.dto.InventarioDashboardResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioEntregaMemberResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioMovimientoResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoListItemResponse;
import pe.cpsp.sistema.inventario.domain.model.InventarioEntrega;
import pe.cpsp.sistema.inventario.domain.model.InventarioMovimiento;
import pe.cpsp.sistema.inventario.domain.model.InventarioProducto;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioEntregaRepository;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioMovimientoRepository;
import pe.cpsp.sistema.inventario.infrastructure.persistence.repository.InventarioProductoRepository;

@Service
@Transactional
public class InventarioService {

  private static final String ESTADO_HABILITADO = "HABILITADO";
  private static final String TIPO_VENTA = "VENTA";

  private final InventarioProductoRepository inventarioProductoRepository;
  private final InventarioEntregaRepository inventarioEntregaRepository;
  private final InventarioMovimientoRepository inventarioMovimientoRepository;
  private final ColegiadoRepository colegiadoRepository;
  private final ColegiadoService colegiadoService;

  public InventarioService(
      InventarioProductoRepository inventarioProductoRepository,
      InventarioEntregaRepository inventarioEntregaRepository,
      InventarioMovimientoRepository inventarioMovimientoRepository,
      ColegiadoRepository colegiadoRepository,
      ColegiadoService colegiadoService) {
    this.inventarioProductoRepository = inventarioProductoRepository;
    this.inventarioEntregaRepository = inventarioEntregaRepository;
    this.inventarioMovimientoRepository = inventarioMovimientoRepository;
    this.colegiadoRepository = colegiadoRepository;
    this.colegiadoService = colegiadoService;
  }

  @Transactional(readOnly = true)
  public InventarioDashboardResponse getDashboard() {
    List<InventarioProductoListItemResponse> productos =
        inventarioProductoRepository.findAllByActivoTrueOrderByNombreAsc().stream()
            .map(this::toListItem)
            .toList();

    List<InventarioMovimientoResponse> movimientos =
        inventarioMovimientoRepository.findTop20ByOrderByFechaMovimientoDesc().stream()
            .map(this::toMovimientoResponse)
            .toList();

    return new InventarioDashboardResponse(productos, movimientos);
  }

  @Transactional(readOnly = true)
  public InventarioProductoDetailResponse getProductoDetail(Long productoId) {
    InventarioProducto producto = findProducto(productoId);
    return toDetail(producto);
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

    registrarMovimiento(producto, "ENTREGA", "Entrega confirmada a colegiado habilitado", -1);

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
              registrarMovimiento(producto, "REVERSA_ENTREGA", "Reversion de entrega registrada", 1);
            });

    return getProductoDetail(productoId);
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
}
