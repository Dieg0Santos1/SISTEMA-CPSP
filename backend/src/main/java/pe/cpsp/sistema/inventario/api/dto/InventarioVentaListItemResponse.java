package pe.cpsp.sistema.inventario.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventarioVentaListItemResponse(
    Long id,
    String referencia,
    String clienteTipo,
    String clienteCodigo,
    String clienteNombre,
    String clienteDetalle,
    String resumenItems,
    int totalUnidades,
    String metodoPago,
    LocalDate fechaVenta,
    BigDecimal total) {}
