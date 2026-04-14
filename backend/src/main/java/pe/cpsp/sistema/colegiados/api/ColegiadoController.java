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
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoEspecialidadesRequest;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoUpsertRequest;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;

@RestController
@RequestMapping("/api/v1/colegiados")
public class ColegiadoController {

  private final ColegiadoService colegiadoService;

  public ColegiadoController(ColegiadoService colegiadoService) {
    this.colegiadoService = colegiadoService;
  }

  @GetMapping
  public List<ColegiadoResponse> listAll() {
    return colegiadoService.listAll();
  }

  @GetMapping("/{id}")
  public ColegiadoResponse getById(@PathVariable Long id) {
    return colegiadoService.getById(id);
  }

  @GetMapping("/dni/{dni}")
  public ColegiadoResponse getByDni(@PathVariable String dni) {
    return colegiadoService.getByDni(dni);
  }

  @GetMapping("/codigo/{codigoColegiatura}")
  public ColegiadoResponse getByCodigo(@PathVariable String codigoColegiatura) {
    return colegiadoService.getByCodigo(codigoColegiatura);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ColegiadoResponse create(@Valid @RequestBody ColegiadoUpsertRequest request) {
    return colegiadoService.create(request);
  }

  @PutMapping("/{id}")
  public ColegiadoResponse update(
      @PathVariable Long id, @Valid @RequestBody ColegiadoUpsertRequest request) {
    return colegiadoService.update(id, request);
  }

  @PutMapping("/{id}/especialidades")
  public ColegiadoResponse updateEspecialidades(
      @PathVariable Long id, @Valid @RequestBody ColegiadoEspecialidadesRequest request) {
    return colegiadoService.updateEspecialidades(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    colegiadoService.delete(id);
  }
}
