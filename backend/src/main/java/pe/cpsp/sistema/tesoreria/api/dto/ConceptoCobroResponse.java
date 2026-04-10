package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;

public record ConceptoCobroResponse(
    Long id,
    String codigo,
    String nombre,
    String categoria,
    String descripcion,
    BigDecimal montoBase,
    boolean usaPeriodo,
    boolean permiteCantidad,
    boolean admiteDescuento,
    boolean admiteMora,
    boolean afectaHabilitacion,
    boolean exoneradoIgv,
    boolean requiereAdjunto,
    String estado) {}
