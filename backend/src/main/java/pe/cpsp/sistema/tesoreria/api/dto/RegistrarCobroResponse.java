package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RegistrarCobroResponse(
    Long cobroId,
    String colegiadoNombre,
    String codigoColegiatura,
    String dni,
    String tipoComprobante,
    String serie,
    Long numeroComprobante,
    LocalDate fechaEmision,
    String metodoPago,
    String observacion,
    BigDecimal subtotal,
    BigDecimal descuentoTotal,
    BigDecimal moraTotal,
    BigDecimal total,
    boolean impreso,
    List<CobroItemResponse> items) {}
