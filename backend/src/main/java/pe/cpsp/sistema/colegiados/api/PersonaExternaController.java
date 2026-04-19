package pe.cpsp.sistema.colegiados.api;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaResponse;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaUpsertRequest;
import pe.cpsp.sistema.colegiados.application.PersonaExternaService;

@RestController
@RequestMapping("/api/v1/colegiados/externos")
public class PersonaExternaController {

  private final PersonaExternaService personaExternaService;

  public PersonaExternaController(PersonaExternaService personaExternaService) {
    this.personaExternaService = personaExternaService;
  }

  @GetMapping
  public List<PersonaExternaResponse> listAll() {
    return personaExternaService.listAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public PersonaExternaResponse create(@Valid @RequestBody PersonaExternaUpsertRequest request) {
    return personaExternaService.create(request);
  }

  @PutMapping("/{id}")
  public PersonaExternaResponse update(
      @PathVariable Long id, @Valid @RequestBody PersonaExternaUpsertRequest request) {
    return personaExternaService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    personaExternaService.delete(id);
  }
}
