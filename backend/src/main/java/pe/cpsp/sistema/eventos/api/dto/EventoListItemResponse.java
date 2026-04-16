package pe.cpsp.sistema.eventos.api.dto;

import java.time.LocalDateTime;

public record EventoListItemResponse(
    Long id,
    String nombre,
    String descripcion,
    LocalDateTime fechaHora,
    int asistenciasRegistradas) {}
