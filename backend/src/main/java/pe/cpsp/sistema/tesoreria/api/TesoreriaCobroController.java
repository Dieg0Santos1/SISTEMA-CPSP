package pe.cpsp.sistema.tesoreria.api;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaCobroService;

@RestController
@RequestMapping("/api/v1/tesoreria/cobros")
public class TesoreriaCobroController {

  private final TesoreriaCobroService tesoreriaCobroService;

  public TesoreriaCobroController(TesoreriaCobroService tesoreriaCobroService) {
    this.tesoreriaCobroService = tesoreriaCobroService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public RegistrarCobroResponse registrarCobro(@Valid @RequestBody RegistrarCobroRequest request) {
    return tesoreriaCobroService.registrarCobro(request);
  }

  @PatchMapping("/{id}/impresion")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void marcarImpreso(@PathVariable Long id) {
    tesoreriaCobroService.marcarImpreso(id);
  }
}
