package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FraccionamientoCuotaResponse(
    Long id,
    int numeroCuota,
    BigDecimal monto,
    LocalDate fechaVencimiento,
    String estado,
    boolean pagada) {}
