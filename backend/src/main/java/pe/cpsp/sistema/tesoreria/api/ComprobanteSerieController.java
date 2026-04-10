package pe.cpsp.sistema.tesoreria.api;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteSerieResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria/comprobantes/series")
public class ComprobanteSerieController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public ComprobanteSerieController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
  }

  @GetMapping
  public List<ComprobanteSerieResponse> listSeriesActivas() {
    return tesoreriaQueryService.listSeriesActivas();
  }
}
