package pe.cpsp.sistema.eventos.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EventoDetailResponse(
    Long id,
    String nombre,
    String descripcion,
    LocalDateTime fechaHora,
    int asistenciasRegistradas,
    List<EventoAttendanceMemberResponse> colegiados) {}
