package pe.cpsp.sistema.tesoreria.api;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroCatalogoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroDeleteResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroUpsertRequest;
import pe.cpsp.sistema.tesoreria.application.ConceptoCobroAdminService;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;
import pe.cpsp.sistema.tesoreria.application.TesoreriaReportService;

@RestController
@RequestMapping("/api/v1/tesoreria/conceptos-cobro")
public class ConceptoCobroController {

  private final TesoreriaQueryService tesoreriaQueryService;
  private final ConceptoCobroAdminService conceptoCobroAdminService;
  private final TesoreriaReportService tesoreriaReportService;

  public ConceptoCobroController(
      TesoreriaQueryService tesoreriaQueryService,
      ConceptoCobroAdminService conceptoCobroAdminService,
      TesoreriaReportService tesoreriaReportService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
    this.conceptoCobroAdminService = conceptoCobroAdminService;
    this.tesoreriaReportService = tesoreriaReportService;
  }

  @GetMapping
  public List<ConceptoCobroResponse> listConceptosCobro() {
    return tesoreriaQueryService.listConceptosCobro();
  }

  @GetMapping("/catalogo")
  public ConceptoCobroCatalogoResponse getCatalogoConceptosCobro() {
    return tesoreriaQueryService.getConceptosCobroCatalogo();
  }

  @GetMapping("/catalogo/export")
  public ResponseEntity<byte[]> exportCatalogoConceptosCobro(String format) {
    TesoreriaReportService.ReportFile report =
        tesoreriaReportService.exportConceptosCatalogo(format);

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

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ConceptoCobroResponse createConceptoCobro(
      @Valid @RequestBody ConceptoCobroUpsertRequest request) {
    return conceptoCobroAdminService.crear(request);
  }

  @PutMapping("/{conceptoId}")
  public ConceptoCobroResponse updateConceptoCobro(
      @PathVariable Long conceptoId, @Valid @RequestBody ConceptoCobroUpsertRequest request) {
    return conceptoCobroAdminService.actualizar(conceptoId, request);
  }

  @DeleteMapping("/{conceptoId}")
  public ConceptoCobroDeleteResponse deleteConceptoCobro(@PathVariable Long conceptoId) {
    return conceptoCobroAdminService.eliminar(conceptoId);
  }
}
