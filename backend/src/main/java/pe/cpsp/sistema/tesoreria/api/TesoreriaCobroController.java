package pe.cpsp.sistema.tesoreria.api;

import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.common.reporting.ComprobantePdfService;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaCobroService;

@RestController
@RequestMapping("/api/v1/tesoreria/cobros")
public class TesoreriaCobroController {

  private final TesoreriaCobroService tesoreriaCobroService;
  private final ComprobantePdfService comprobantePdfService;

  public TesoreriaCobroController(
      TesoreriaCobroService tesoreriaCobroService,
      ComprobantePdfService comprobantePdfService) {
    this.tesoreriaCobroService = tesoreriaCobroService;
    this.comprobantePdfService = comprobantePdfService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public RegistrarCobroResponse registrarCobro(@Valid @RequestBody RegistrarCobroRequest request) {
    return tesoreriaCobroService.registrarCobro(request);
  }

  @GetMapping("/{id}")
  public RegistrarCobroResponse getCobro(@PathVariable Long id) {
    return tesoreriaCobroService.getCobro(id);
  }

  @GetMapping("/{id}/pdf")
  public ResponseEntity<byte[]> getCobroPdf(@PathVariable Long id) {
    RegistrarCobroResponse receipt = tesoreriaCobroService.getCobro(id);
    byte[] pdf = comprobantePdfService.buildCobroPdf(receipt);
    String filename = receipt.serie() + "-" + String.format("%07d", receipt.numeroComprobante()) + ".pdf";

    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.inline().filename(filename).build().toString())
        .contentType(MediaType.APPLICATION_PDF)
        .body(pdf);
  }

  @PatchMapping("/{id}/impresion")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void marcarImpreso(@PathVariable Long id) {
    tesoreriaCobroService.marcarImpreso(id);
  }
}
