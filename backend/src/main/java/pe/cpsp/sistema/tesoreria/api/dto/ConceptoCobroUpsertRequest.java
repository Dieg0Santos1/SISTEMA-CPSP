package pe.cpsp.sistema.tesoreria.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ConceptoCobroUpsertRequest(
    @NotBlank(message = "El codigo es obligatorio.")
        @Size(max = 30, message = "El codigo no debe exceder 30 caracteres.")
        String codigo,
    @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no debe exceder 120 caracteres.")
        String nombre,
    @NotBlank(message = "La categoria es obligatoria.")
        @Size(max = 40, message = "La categoria no debe exceder 40 caracteres.")
        String categoria,
    @Size(max = 255, message = "La descripcion no debe exceder 255 caracteres.")
        String descripcion,
    @NotNull(message = "El monto base es obligatorio.")
        @DecimalMin(value = "0.00", inclusive = true, message = "El monto base no puede ser negativo.")
        BigDecimal montoBase,
    boolean usaPeriodo,
    boolean permiteCantidad,
    boolean admiteDescuento,
    boolean admiteMora,
    boolean afectaHabilitacion,
    boolean exoneradoIgv,
    boolean requiereAdjunto,
    @NotBlank(message = "El estado es obligatorio.")
        @Size(max = 20, message = "El estado no debe exceder 20 caracteres.")
        String estado) {}
