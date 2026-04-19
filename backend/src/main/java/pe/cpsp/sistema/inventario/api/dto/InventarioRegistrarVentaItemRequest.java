package pe.cpsp.sistema.inventario.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InventarioRegistrarVentaItemRequest(
    @NotNull Long productoId,
    @NotNull @Positive Integer cantidad) {}
