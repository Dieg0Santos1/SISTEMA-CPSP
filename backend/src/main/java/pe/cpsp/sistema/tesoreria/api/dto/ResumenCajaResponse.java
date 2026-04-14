package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;

public record ResumenCajaResponse(
    String title,
    BigDecimal amount,
    long operationsCount) {}
