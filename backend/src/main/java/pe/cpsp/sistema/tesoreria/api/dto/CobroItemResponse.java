package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;

public record CobroItemResponse(
    String concepto,
    String codigoConcepto,
    String periodoReferencia,
    Integer cantidad,
    BigDecimal montoUnitario,
    BigDecimal descuento,
    BigDecimal mora,
    BigDecimal totalLinea) {}
