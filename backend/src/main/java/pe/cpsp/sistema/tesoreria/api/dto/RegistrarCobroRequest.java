package pe.cpsp.sistema.tesoreria.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record RegistrarCobroRequest(
    @NotNull Long colegiadoId,
    @NotBlank String tipoComprobante,
    @NotNull LocalDate fechaEmision,
    @NotBlank String metodoPago,
    String observacion,
    @NotEmpty List<@Valid RegistrarCobroItemRequest> items) {}
