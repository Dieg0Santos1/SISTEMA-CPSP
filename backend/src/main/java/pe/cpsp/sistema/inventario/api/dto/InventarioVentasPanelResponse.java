package pe.cpsp.sistema.inventario.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record InventarioVentasPanelResponse(
    long ventasRegistradas,
    long unidadesVendidas,
    BigDecimal montoRecaudado,
    BigDecimal ticketPromedio,
    List<InventarioVentaListItemResponse> ventas) {}
