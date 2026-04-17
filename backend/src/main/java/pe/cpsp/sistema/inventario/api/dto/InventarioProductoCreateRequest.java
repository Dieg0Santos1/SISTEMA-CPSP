package pe.cpsp.sistema.inventario.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record InventarioProductoCreateRequest(
    @NotBlank(message = "El codigo del producto es obligatorio.")
    @Size(max = 40, message = "El codigo no puede exceder 40 caracteres.")
    String codigo,
    @NotBlank(message = "El nombre del producto es obligatorio.")
    @Size(max = 160, message = "El nombre no puede exceder 160 caracteres.")
    String nombre,
    @NotBlank(message = "La categoria del producto es obligatoria.")
    @Size(max = 80, message = "La categoria no puede exceder 80 caracteres.")
    String categoria,
    @Size(max = 600, message = "La descripcion no puede exceder 600 caracteres.")
    String descripcion,
    @NotNull(message = "El precio de referencia es obligatorio.")
    @DecimalMin(value = "0.00", inclusive = true, message = "El precio no puede ser negativo.")
    BigDecimal precioReferencia,
    @NotNull(message = "El stock inicial es obligatorio.")
    @Min(value = 0, message = "El stock inicial no puede ser negativo.")
    Integer stockInicial) {}
