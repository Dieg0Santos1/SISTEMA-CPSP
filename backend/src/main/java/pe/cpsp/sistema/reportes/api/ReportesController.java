package pe.cpsp.sistema.reportes.api;

import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.reportes.application.ReportesService;

@RestController
@RequestMapping("/api/v1/reportes")
public class ReportesController {

  private final ReportesService reportesService;

  public ReportesController(ReportesService reportesService) {
    this.reportesService = reportesService;
  }

  @GetMapping("/colegiados-periodo/export")
  public ResponseEntity<byte[]> exportColegiadosPorPeriodo(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(defaultValue = "pdf") String format) {
    ReportesService.ReportFile report = reportesService.exportColegiadosPorPeriodo(from, to, format);
    return toFileResponse(report);
  }

  @GetMapping("/ingresos-periodo/export")
  public ResponseEntity<byte[]> exportIngresosPorPeriodo(
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
      @RequestParam(defaultValue = "pdf") String format) {
    ReportesService.ReportFile report = reportesService.exportIngresosPorPeriodo(from, to, format);
    return toFileResponse(report);
  }

  private ResponseEntity<byte[]> toFileResponse(ReportesService.ReportFile report) {
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(report.contentType()))
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(report.filename()).build().toString())
        .body(report.content());
  }
}
