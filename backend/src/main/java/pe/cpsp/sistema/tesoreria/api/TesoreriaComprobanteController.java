package pe.cpsp.sistema.tesoreria.api;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobantesPageResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;
import pe.cpsp.sistema.tesoreria.application.TesoreriaReportService;

@RestController
@RequestMapping("/api/v1/tesoreria/comprobantes")
public class TesoreriaComprobanteController {

  private final TesoreriaQueryService tesoreriaQueryService;
  private final TesoreriaReportService tesoreriaReportService;

  public TesoreriaComprobanteController(
      TesoreriaQueryService tesoreriaQueryService,
      TesoreriaReportService tesoreriaReportService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
    this.tesoreriaReportService = tesoreriaReportService;
  }

  @GetMapping
  public ComprobantesPageResponse getComprobantes(
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "Todos") String printStatus,
      @RequestParam(defaultValue = "Todos") String tipo,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size) {
    return tesoreriaQueryService.getComprobantes(search, printStatus, tipo, page, size);
  }

  @GetMapping("/export")
  public ResponseEntity<byte[]> exportComprobantes(
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "Todos") String printStatus,
      @RequestParam(defaultValue = "Todos") String tipo,
      @RequestParam(defaultValue = "pdf") String format) {
    TesoreriaReportService.ReportFile report =
        tesoreriaReportService.exportComprobantes(search, printStatus, tipo, format);

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
}
