package pe.cpsp.sistema.inventario.api.dto;

import java.time.LocalDateTime;

public record InventarioMovimientoResponse(
    Long id,
    Long productoId,
    String productoNombre,
    String tipo,
    String detalle,
    int cantidad,
    LocalDateTime fechaMovimiento) {}
