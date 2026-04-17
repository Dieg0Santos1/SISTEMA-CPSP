package pe.cpsp.sistema.tesoreria.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CrearFraccionamientoRequest(
    @NotNull(message = "La fecha de inicio es obligatoria.") LocalDate fechaInicio,
    @NotNull(message = "El numero de cuotas es obligatorio.")
        @Min(value = 2, message = "El fraccionamiento debe tener al menos 2 cuotas.")
        Integer numeroCuotas,
    String observacion) {}
