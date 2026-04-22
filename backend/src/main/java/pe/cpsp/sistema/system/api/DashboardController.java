package pe.cpsp.sistema.system.api;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.system.application.DashboardReportService;
import org.springframework.web.bind.annotation.GetMapping;
import pe.cpsp.sistema.system.application.DashboardService;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

  private final DashboardService dashboardService;
  private final DashboardReportService dashboardReportService;

  public DashboardController(
      DashboardService dashboardService,
      DashboardReportService dashboardReportService) {
    this.dashboardService = dashboardService;
    this.dashboardReportService = dashboardReportService;
  }

  @GetMapping
  public DashboardOverviewResponse getOverview() {
    return dashboardService.getOverview();
  }

  @GetMapping("/upcoming-ceremonies/export")
  public ResponseEntity<byte[]> exportUpcomingCeremonies(
      @RequestParam(defaultValue = "xlsx") String format) {
    DashboardReportService.ReportFile reportFile = dashboardReportService.exportUpcomingCeremonies(format);

    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(reportFile.filename()).build().toString())
        .contentType(MediaType.parseMediaType(reportFile.contentType()))
        .body(reportFile.content());
  }
}
