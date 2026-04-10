package pe.cpsp.sistema.tesoreria.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.TesoreriaResumenResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria")
public class TesoreriaResumenController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public TesoreriaResumenController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
  }

  @GetMapping("/resumen")
  public TesoreriaResumenResponse getResumen() {
    return tesoreriaQueryService.getResumen();
  }
}
