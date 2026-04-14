package pe.cpsp.sistema.tesoreria.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoListItemResponse;
import pe.cpsp.sistema.tesoreria.api.dto.PagedResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria/colegiados")
public class TesoreriaColegiadoController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public TesoreriaColegiadoController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
  }

  @GetMapping
  public PagedResponse<CobranzaColegiadoListItemResponse> listColegiados(
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "5") int size) {
    return tesoreriaQueryService.listColegiados(search, page, size);
  }

  @GetMapping("/{id}/cobranza")
  public CobranzaColegiadoDetailResponse getCobranza(@PathVariable Long id) {
    return tesoreriaQueryService.getColegiadoCobranza(id);
  }
}
