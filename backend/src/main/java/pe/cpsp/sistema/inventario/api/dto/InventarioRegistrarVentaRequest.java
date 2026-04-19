package pe.cpsp.sistema.inventario.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record InventarioRegistrarVentaRequest(
    @NotBlank String clienteTipo,
    @NotNull Long clienteId,
    @NotBlank String metodoPago,
    @NotNull LocalDate fechaVenta,
    String observacion,
    @NotEmpty List<@Valid InventarioRegistrarVentaItemRequest> items) {}
