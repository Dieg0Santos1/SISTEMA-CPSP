package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ComprobanteListadoResponse(
    Long cobroId,
    String tipoComprobante,
    String serie,
    Long numeroComprobante,
    String colegiadoNombre,
    LocalDate fechaEmision,
    BigDecimal total,
    String estado,
    boolean impreso) {}
