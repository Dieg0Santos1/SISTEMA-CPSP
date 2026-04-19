package pe.cpsp.sistema.tesoreria.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoPanelDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientosPageResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria/fraccionamientos")
public class TesoreriaFraccionamientosController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public TesoreriaFraccionamientosController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
  }

  @GetMapping
  public FraccionamientosPageResponse getFraccionamientos(
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "5") int size) {
    return tesoreriaQueryService.getFraccionamientos(search, page, size);
  }

  @GetMapping("/{id}")
  public FraccionamientoPanelDetailResponse getFraccionamientoDetail(@PathVariable Long id) {
    return tesoreriaQueryService.getFraccionamientoDetail(id);
  }
}
