package pe.cpsp.sistema.tesoreria.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.HistorialPageResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria/historial")
public class TesoreriaHistorialController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public TesoreriaHistorialController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
  }

  @GetMapping
  public HistorialPageResponse getHistorial(
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "Todos") String metodoPago,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int size) {
    return tesoreriaQueryService.getHistorial(search, metodoPago, page, size);
  }
}
