package pe.cpsp.sistema.inventario.api;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.inventario.api.dto.InventarioClienteVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioDashboardResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoCreateRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoListItemResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentasPanelResponse;
import pe.cpsp.sistema.inventario.application.InventarioService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventario")
public class InventarioController {

  private final InventarioService inventarioService;

  public InventarioController(InventarioService inventarioService) {
    this.inventarioService = inventarioService;
  }

  @GetMapping
  public InventarioDashboardResponse getDashboard() {
    return inventarioService.getDashboard();
  }

  @GetMapping("/clientes")
  public List<InventarioClienteVentaResponse> listClientesVenta() {
    return inventarioService.listClientesVenta();
  }

  @GetMapping("/ventas")
  public InventarioVentasPanelResponse getVentasPanel() {
    return inventarioService.getVentasPanel();
  }

  @PostMapping("/ventas")
  @ResponseStatus(HttpStatus.CREATED)
  public InventarioVentaResponse registrarVenta(
      @Valid @RequestBody InventarioRegistrarVentaRequest request) {
    return inventarioService.registrarVenta(request);
  }

  @PostMapping("/productos")
  @ResponseStatus(HttpStatus.CREATED)
  public InventarioProductoListItemResponse createProducto(
      @Valid @RequestBody InventarioProductoCreateRequest request) {
    return inventarioService.crearProducto(request);
  }

  @GetMapping("/productos/{productoId}")
  public InventarioProductoDetailResponse getProductoDetail(@PathVariable Long productoId) {
    return inventarioService.getProductoDetail(productoId);
  }

  @PutMapping("/productos/{productoId}/entregas/{colegiadoId}")
  public InventarioProductoDetailResponse registrarEntrega(
      @PathVariable Long productoId, @PathVariable Long colegiadoId) {
    return inventarioService.registrarEntrega(productoId, colegiadoId);
  }

  @DeleteMapping("/productos/{productoId}/entregas/{colegiadoId}")
  public InventarioProductoDetailResponse quitarEntrega(
      @PathVariable Long productoId, @PathVariable Long colegiadoId) {
    return inventarioService.quitarEntrega(productoId, colegiadoId);
  }
}
