package pe.cpsp.sistema.eventos.api.dto;

public record EventoAttendanceMemberResponse(
    Long personaId,
    String tipoRegistro,
    String codigo,
    String documento,
    String nombreCompleto,
    String detalle,
    String estado,
    boolean asistio) {}
