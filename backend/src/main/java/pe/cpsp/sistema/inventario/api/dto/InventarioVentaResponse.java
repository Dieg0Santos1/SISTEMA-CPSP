package pe.cpsp.sistema.inventario.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record InventarioVentaResponse(
    Long id,
    String referencia,
    String tipoComprobante,
    String serie,
    Long numeroComprobante,
    String clienteTipo,
    String clienteCodigo,
    String clienteNombre,
    String clienteDocumento,
    String clienteDetalle,
    String metodoPago,
    LocalDate fechaVenta,
    String observacion,
    BigDecimal total,
    boolean impreso,
    List<InventarioVentaItemResponse> items) {}
