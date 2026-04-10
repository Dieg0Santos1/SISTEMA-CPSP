package pe.cpsp.sistema.tesoreria.api;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@RestController
@RequestMapping("/api/v1/tesoreria/conceptos-cobro")
public class ConceptoCobroController {

  private final TesoreriaQueryService tesoreriaQueryService;

  public ConceptoCobroController(TesoreriaQueryService tesoreriaQueryService) {
    this.tesoreriaQueryService = tesoreriaQueryService;
  }

  @GetMapping
  public List<ConceptoCobroResponse> listConceptosCobro() {
    return tesoreriaQueryService.listConceptosCobro();
  }
}
