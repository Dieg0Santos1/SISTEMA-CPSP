package pe.cpsp.sistema.eventos.api;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.eventos.api.dto.EventoCreateRequest;
import pe.cpsp.sistema.eventos.api.dto.EventoDetailResponse;
import pe.cpsp.sistema.eventos.api.dto.EventoListItemResponse;
import pe.cpsp.sistema.eventos.application.EventoService;

@RestController
@RequestMapping("/api/v1/eventos")
public class EventoController {

  private final EventoService eventoService;

  public EventoController(EventoService eventoService) {
    this.eventoService = eventoService;
  }

  @GetMapping
  public List<EventoListItemResponse> listAll() {
    return eventoService.listAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public EventoDetailResponse create(@Valid @RequestBody EventoCreateRequest request) {
    return eventoService.create(request);
  }

  @GetMapping("/{id}")
  public EventoDetailResponse getDetail(@PathVariable Long id) {
    return eventoService.getDetail(id);
  }

  @PutMapping("/{eventoId}/asistencias/{personaId}")
  public EventoDetailResponse registrarAsistencia(
      @PathVariable Long eventoId,
      @PathVariable Long personaId,
      @RequestParam(name = "tipo", defaultValue = "COLEGIADO") String tipoRegistro) {
    return eventoService.registrarAsistencia(eventoId, personaId, tipoRegistro);
  }

  @DeleteMapping("/{eventoId}/asistencias/{personaId}")
  public EventoDetailResponse quitarAsistencia(
      @PathVariable Long eventoId,
      @PathVariable Long personaId,
      @RequestParam(name = "tipo", defaultValue = "COLEGIADO") String tipoRegistro) {
    return eventoService.quitarAsistencia(eventoId, personaId, tipoRegistro);
  }
}
