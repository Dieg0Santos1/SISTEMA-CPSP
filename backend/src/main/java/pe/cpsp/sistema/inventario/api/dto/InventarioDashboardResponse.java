package pe.cpsp.sistema.inventario.api.dto;

import java.util.List;

public record InventarioDashboardResponse(
    List<InventarioProductoListItemResponse> productos,
    List<InventarioMovimientoResponse> movimientos) {}
