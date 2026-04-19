package pe.cpsp.sistema.inventario.api.dto;

import java.math.BigDecimal;

public record InventarioVentaItemResponse(
    Long productoId,
    String codigo,
    String nombre,
    int cantidad,
    BigDecimal precioUnitario,
    BigDecimal totalLinea) {}
