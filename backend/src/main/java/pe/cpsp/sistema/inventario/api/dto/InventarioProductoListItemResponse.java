package pe.cpsp.sistema.inventario.api.dto;

import java.math.BigDecimal;

public record InventarioProductoListItemResponse(
    Long id,
    String codigo,
    String nombre,
    String categoria,
    String descripcion,
    BigDecimal precioReferencia,
    int stockActual,
    int entregasRegistradas,
    long ventasRegistradas) {}
