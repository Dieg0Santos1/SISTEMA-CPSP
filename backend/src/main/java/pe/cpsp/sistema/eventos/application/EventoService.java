package pe.cpsp.sistema.eventos.application;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.eventos.api.dto.EventoAttendanceMemberResponse;
import pe.cpsp.sistema.eventos.api.dto.EventoCreateRequest;
import pe.cpsp.sistema.eventos.api.dto.EventoDetailResponse;
import pe.cpsp.sistema.eventos.api.dto.EventoListItemResponse;
import pe.cpsp.sistema.eventos.domain.model.Evento;
import pe.cpsp.sistema.eventos.domain.model.EventoAsistencia;
import pe.cpsp.sistema.eventos.infrastructure.persistence.repository.EventoAsistenciaRepository;
import pe.cpsp.sistema.eventos.infrastructure.persistence.repository.EventoRepository;

@Service
@Transactional
public class EventoService {

  private final EventoRepository eventoRepository;
  private final EventoAsistenciaRepository eventoAsistenciaRepository;
  private final ColegiadoRepository colegiadoRepository;
  private final ColegiadoService colegiadoService;

  public EventoService(
      EventoRepository eventoRepository,
      EventoAsistenciaRepository eventoAsistenciaRepository,
      ColegiadoRepository colegiadoRepository,
      ColegiadoService colegiadoService) {
    this.eventoRepository = eventoRepository;
    this.eventoAsistenciaRepository = eventoAsistenciaRepository;
    this.colegiadoRepository = colegiadoRepository;
    this.colegiadoService = colegiadoService;
  }

  @Transactional(readOnly = true)
  public List<EventoListItemResponse> listAll() {
    return eventoRepository.findAllByOrderByFechaHoraAsc().stream().map(this::toListItem).toList();
  }

  public EventoDetailResponse create(EventoCreateRequest request) {
    Evento evento = new Evento();
    evento.setNombre(request.nombre().trim());
    evento.setDescripcion(request.descripcion().trim());
    evento.setFechaHora(LocalDateTime.of(request.fecha(), request.hora()));

    Evento saved = eventoRepository.save(evento);
    return getDetail(saved.getId());
  }

  @Transactional(readOnly = true)
  public EventoDetailResponse getDetail(Long id) {
    Evento evento =
        eventoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el evento solicitado."));

    return toDetail(evento);
  }

  public EventoDetailResponse registrarAsistencia(Long eventoId, Long colegiadoId) {
    Evento evento = findEvento(eventoId);
    Colegiado colegiado = findColegiado(colegiadoId);

    if (eventoAsistenciaRepository.findByEventoIdAndColegiadoId(eventoId, colegiadoId).isEmpty()) {
      EventoAsistencia asistencia = new EventoAsistencia();
      asistencia.setEvento(evento);
      asistencia.setColegiado(colegiado);
      eventoAsistenciaRepository.save(asistencia);
      evento.getAsistencias().add(asistencia);
    }

    return getDetail(eventoId);
  }

  public EventoDetailResponse quitarAsistencia(Long eventoId, Long colegiadoId) {
    Evento evento = findEvento(eventoId);
    findColegiado(colegiadoId);

    eventoAsistenciaRepository
        .findByEventoIdAndColegiadoId(eventoId, colegiadoId)
        .ifPresent(
            asistencia -> {
              eventoAsistenciaRepository.delete(asistencia);
              evento.getAsistencias().removeIf(item -> item.getId().equals(asistencia.getId()));
            });

    return getDetail(eventoId);
  }

  private Evento findEvento(Long eventoId) {
    return eventoRepository
        .findById(eventoId)
        .orElseThrow(() -> new ResourceNotFoundException("No existe el evento solicitado."));
  }

  private Colegiado findColegiado(Long colegiadoId) {
    return colegiadoRepository
        .findById(colegiadoId)
        .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));
  }

  private EventoListItemResponse toListItem(Evento evento) {
    return new EventoListItemResponse(
        evento.getId(),
        evento.getNombre(),
        evento.getDescripcion(),
        evento.getFechaHora(),
        evento.getAsistencias().size());
  }

  private EventoDetailResponse toDetail(Evento evento) {
    Set<Long> attendees =
        evento.getAsistencias().stream().map(asistencia -> asistencia.getColegiado().getId()).collect(java.util.stream.Collectors.toSet());

    List<EventoAttendanceMemberResponse> colegiados =
        colegiadoService.listAll().stream()
            .map(colegiado -> toAttendanceMember(colegiado, attendees.contains(colegiado.id())))
            .toList();

    return new EventoDetailResponse(
        evento.getId(),
        evento.getNombre(),
        evento.getDescripcion(),
        evento.getFechaHora(),
        attendees.size(),
        colegiados);
  }

  private EventoAttendanceMemberResponse toAttendanceMember(
      ColegiadoResponse colegiado, boolean asistio) {
    return new EventoAttendanceMemberResponse(
        colegiado.id(),
        colegiado.codigoColegiatura(),
        colegiado.nombreCompleto(),
        primarySpecialty(colegiado),
        colegiado.estado(),
        asistio);
  }

  private String primarySpecialty(ColegiadoResponse colegiado) {
    return colegiado.especialidades().isEmpty()
        ? "Sin especialidad registrada"
        : String.join(", ", colegiado.especialidades());
  }
}
