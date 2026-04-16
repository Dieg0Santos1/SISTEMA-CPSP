package pe.cpsp.sistema.eventos.api.dto;

public record EventoAttendanceMemberResponse(
    Long colegiadoId,
    String codigoColegiatura,
    String nombreCompleto,
    String especialidadPrincipal,
    String estado,
    boolean asistio) {}
