package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;

public record ResumenCanalResponse(
    String label,
    long percentage,
    BigDecimal amount,
    long operationsCount) {}
