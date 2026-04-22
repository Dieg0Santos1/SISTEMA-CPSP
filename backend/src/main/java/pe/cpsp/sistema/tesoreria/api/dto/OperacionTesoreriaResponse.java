package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OperacionTesoreriaResponse(
    Long cobroId,
    String reference,
    LocalDate fechaEmision,
    String colegiadoNombre,
    String conceptoResumen,
    String metodoPago,
    BigDecimal total,
    String serie,
    Long numeroComprobante,
    String origenOperacion,
    String estado) {}
