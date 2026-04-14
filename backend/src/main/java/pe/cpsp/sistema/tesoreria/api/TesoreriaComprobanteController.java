package pe.cpsp.sistema.tesoreria.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobantesPageResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria/comprobantes")
public class TesoreriaComprobanteController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public TesoreriaComprobanteController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
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
}
