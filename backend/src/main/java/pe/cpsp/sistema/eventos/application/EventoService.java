package pe.cpsp.sistema.eventos.application;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaResponse;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.application.PersonaExternaService;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.domain.model.PersonaExterna;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.PersonaExternaRepository;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
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
  private final PersonaExternaRepository personaExternaRepository;
  private final PersonaExternaService personaExternaService;

  public EventoService(
      EventoRepository eventoRepository,
      EventoAsistenciaRepository eventoAsistenciaRepository,
      ColegiadoRepository colegiadoRepository,
      ColegiadoService colegiadoService,
      PersonaExternaRepository personaExternaRepository,
      PersonaExternaService personaExternaService) {
    this.eventoRepository = eventoRepository;
    this.eventoAsistenciaRepository = eventoAsistenciaRepository;
    this.colegiadoRepository = colegiadoRepository;
    this.colegiadoService = colegiadoService;
    this.personaExternaRepository = personaExternaRepository;
    this.personaExternaService = personaExternaService;
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

  public EventoDetailResponse registrarAsistencia(Long eventoId, Long personaId, String tipoRegistro) {
    Evento evento = findEvento(eventoId);
    String tipoNormalizado = normalizeTipoRegistro(tipoRegistro);

    if ("COLEGIADO".equals(tipoNormalizado)) {
      Colegiado colegiado = findColegiado(personaId);

      if (eventoAsistenciaRepository.findByEventoIdAndColegiadoId(eventoId, personaId).isEmpty()) {
        EventoAsistencia asistencia = new EventoAsistencia();
        asistencia.setEvento(evento);
        asistencia.setColegiado(colegiado);
        eventoAsistenciaRepository.save(asistencia);
        evento.getAsistencias().add(asistencia);
      }
    } else {
      PersonaExterna personaExterna = findPersonaExterna(personaId);

      if (eventoAsistenciaRepository.findByEventoIdAndPersonaExternaId(eventoId, personaId).isEmpty()) {
        EventoAsistencia asistencia = new EventoAsistencia();
        asistencia.setEvento(evento);
        asistencia.setPersonaExterna(personaExterna);
        eventoAsistenciaRepository.save(asistencia);
        evento.getAsistencias().add(asistencia);
      }
    }

    return getDetail(eventoId);
  }

  public EventoDetailResponse quitarAsistencia(Long eventoId, Long personaId, String tipoRegistro) {
    Evento evento = findEvento(eventoId);
    String tipoNormalizado = normalizeTipoRegistro(tipoRegistro);

    if ("COLEGIADO".equals(tipoNormalizado)) {
      findColegiado(personaId);
      eventoAsistenciaRepository
          .findByEventoIdAndColegiadoId(eventoId, personaId)
          .ifPresent(
              asistencia -> {
                eventoAsistenciaRepository.delete(asistencia);
                evento.getAsistencias().removeIf(item -> item.getId().equals(asistencia.getId()));
              });
    } else {
      findPersonaExterna(personaId);
      eventoAsistenciaRepository
          .findByEventoIdAndPersonaExternaId(eventoId, personaId)
          .ifPresent(
              asistencia -> {
                eventoAsistenciaRepository.delete(asistencia);
                evento.getAsistencias().removeIf(item -> item.getId().equals(asistencia.getId()));
              });
    }

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

  private PersonaExterna findPersonaExterna(Long personaExternaId) {
    return personaExternaRepository
        .findById(personaExternaId)
        .orElseThrow(() -> new ResourceNotFoundException("No existe el externo solicitado."));
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
    Set<Long> attendeeColegiados =
        evento.getAsistencias().stream()
            .map(EventoAsistencia::getColegiado)
            .filter(java.util.Objects::nonNull)
            .map(Colegiado::getId)
            .collect(Collectors.toSet());
    Set<Long> attendeeExternos =
        evento.getAsistencias().stream()
            .map(EventoAsistencia::getPersonaExterna)
            .filter(java.util.Objects::nonNull)
            .map(PersonaExterna::getId)
            .collect(Collectors.toSet());

    List<EventoAttendanceMemberResponse> participantes = new ArrayList<>();

    participantes.addAll(
        colegiadoService.listAll().stream()
            .map(colegiado -> toAttendanceMember(colegiado, attendeeColegiados.contains(colegiado.id())))
            .toList());
    participantes.addAll(
        personaExternaService.listAll().stream()
            .map(externo -> toAttendanceMember(externo, attendeeExternos.contains(externo.id())))
            .toList());

    participantes.sort(java.util.Comparator.comparing(EventoAttendanceMemberResponse::nombreCompleto));

    int asistenciasColegiados = (int) participantes.stream()
        .filter(participante -> "COLEGIADO".equals(participante.tipoRegistro()) && participante.asistio())
        .count();
    int asistenciasExternos = (int) participantes.stream()
        .filter(participante -> "EXTERNO".equals(participante.tipoRegistro()) && participante.asistio())
        .count();

    return new EventoDetailResponse(
        evento.getId(),
        evento.getNombre(),
        evento.getDescripcion(),
        evento.getFechaHora(),
        evento.getAsistencias().size(),
        asistenciasColegiados,
        asistenciasExternos,
        participantes.size(),
        participantes);
  }

  private EventoAttendanceMemberResponse toAttendanceMember(
      ColegiadoResponse colegiado, boolean asistio) {
    return new EventoAttendanceMemberResponse(
        colegiado.id(),
        "COLEGIADO",
        colegiado.codigoColegiatura(),
        colegiado.dni(),
        colegiado.nombreCompleto(),
        primarySpecialty(colegiado),
        colegiado.estado(),
        asistio);
  }

  private EventoAttendanceMemberResponse toAttendanceMember(
      PersonaExternaResponse personaExterna, boolean asistio) {
    return new EventoAttendanceMemberResponse(
        personaExterna.id(),
        "EXTERNO",
        personaExterna.codigoExterno(),
        personaExterna.dni(),
        personaExterna.nombreCompleto(),
        personaExterna.tipoExterno(),
        personaExterna.estado(),
        asistio);
  }

  private String primarySpecialty(ColegiadoResponse colegiado) {
    return colegiado.especialidades().isEmpty()
        ? "Sin especialidad registrada"
        : String.join(", ", colegiado.especialidades());
  }

  private String normalizeTipoRegistro(String tipoRegistro) {
    String value = tipoRegistro == null ? "" : tipoRegistro.trim().toUpperCase();

    if ("COLEGIADO".equals(value) || "EXTERNO".equals(value)) {
      return value;
    }

    throw new InvalidRequestException("Tipo de participante no valido para el evento.");
  }
}
