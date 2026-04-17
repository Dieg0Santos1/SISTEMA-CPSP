package pe.cpsp.sistema.tesoreria.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record RegistrarCobroItemRequest(
    Long conceptoCobroId,
    Long fraccionamientoCuotaId,
    String periodoReferencia,
    @NotNull @Min(1) Integer cantidad,
    @NotNull @DecimalMin("0.00") BigDecimal descuento,
    @NotNull @DecimalMin("0.00") BigDecimal mora) {}
