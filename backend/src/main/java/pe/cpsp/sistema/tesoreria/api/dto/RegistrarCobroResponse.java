package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RegistrarCobroResponse(
    Long cobroId,
    String colegiadoNombre,
    String codigoColegiatura,
    String dni,
    String ruc,
    String tipoComprobante,
    String serie,
    Long numeroComprobante,
    LocalDate fechaEmision,
    LocalDate fechaPago,
    String metodoPago,
    String areaCodigo,
    String areaNombre,
    String generadoPor,
    String observacion,
    BigDecimal subtotal,
    BigDecimal descuentoTotal,
    BigDecimal moraTotal,
    BigDecimal total,
    boolean impreso,
    List<CobroItemResponse> items) {}
