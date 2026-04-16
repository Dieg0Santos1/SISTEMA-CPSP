package pe.cpsp.sistema.inventario.api;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.inventario.api.dto.InventarioDashboardResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.application.InventarioService;

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
