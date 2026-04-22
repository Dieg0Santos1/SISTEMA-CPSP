package pe.cpsp.sistema.inventario.api;

import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.common.reporting.ComprobantePdfService;
import pe.cpsp.sistema.inventario.api.dto.InventarioClienteVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioDashboardResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoCreateRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoListItemResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentasPanelResponse;
import pe.cpsp.sistema.inventario.application.InventarioReportService;
import pe.cpsp.sistema.inventario.application.InventarioService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inventario")
public class InventarioController {

  private final InventarioService inventarioService;
  private final ComprobantePdfService comprobantePdfService;
  private final InventarioReportService inventarioReportService;

  public InventarioController(
      InventarioService inventarioService,
      ComprobantePdfService comprobantePdfService,
      InventarioReportService inventarioReportService) {
    this.inventarioService = inventarioService;
    this.comprobantePdfService = comprobantePdfService;
    this.inventarioReportService = inventarioReportService;
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

  @GetMapping("/ventas/{ventaId}")
  public InventarioVentaResponse getVenta(@PathVariable Long ventaId) {
    return inventarioService.getVenta(ventaId);
  }

  @GetMapping("/ventas/{ventaId}/pdf")
  public ResponseEntity<byte[]> getVentaPdf(@PathVariable Long ventaId) {
    InventarioVentaResponse receipt = inventarioService.getVenta(ventaId);
    byte[] pdf = comprobantePdfService.buildVentaPdf(receipt);
    String filename = receipt.serie() + "-" + String.format("%07d", receipt.numeroComprobante()) + ".pdf";

    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.inline().filename(filename).build().toString())
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }

  @PostMapping("/ventas")
  @ResponseStatus(HttpStatus.CREATED)
  public InventarioVentaResponse registrarVenta(
      @Valid @RequestBody InventarioRegistrarVentaRequest request) {
    return inventarioService.registrarVenta(request);
  }

  @PatchMapping("/ventas/{ventaId}/impresion")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void marcarVentaImpresa(@PathVariable Long ventaId) {
    inventarioService.marcarVentaImpresa(ventaId);
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

  @GetMapping("/productos/{productoId}/export")
  public ResponseEntity<byte[]> exportProducto(
      @PathVariable Long productoId,
      @org.springframework.web.bind.annotation.RequestParam(defaultValue = "pdf") String format) {
    InventarioReportService.ReportFile report =
        inventarioReportService.exportProducto(productoId, format);

    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(report.filename()).build().toString())
        .header(HttpHeaders.CACHE_CONTROL, "no-store")
        .header(HttpHeaders.PRAGMA, "no-cache")
        .header(HttpHeaders.EXPIRES, "0")
        .header(HttpHeaders.CONTENT_TYPE, report.contentType())
        .body(report.content());
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
