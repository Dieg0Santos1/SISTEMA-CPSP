package pe.cpsp.sistema.eventos.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventoCreateRequest(
    @NotBlank(message = "El nombre del evento es obligatorio.")
    @Size(max = 160, message = "El nombre del evento no puede exceder 160 caracteres.")
    String nombre,
    @NotNull(message = "La fecha del evento es obligatoria.") LocalDate fecha,
    @NotNull(message = "La hora del evento es obligatoria.") LocalTime hora,
    @NotBlank(message = "La descripcion del evento es obligatoria.")
    @Size(max = 600, message = "La descripcion del evento no puede exceder 600 caracteres.")
    String descripcion) {}
