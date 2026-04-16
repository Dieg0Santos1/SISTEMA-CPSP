package pe.cpsp.sistema.inventario.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record InventarioProductoDetailResponse(
    Long id,
    String codigo,
    String nombre,
    String categoria,
    String descripcion,
    BigDecimal precioReferencia,
    int stockActual,
    int entregasRegistradas,
    long ventasRegistradas,
    List<InventarioEntregaMemberResponse> colegiados) {}
