package pe.cpsp.sistema.tesoreria.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record RegistrarCobroRequest(
    @NotNull Long colegiadoId,
    @NotBlank String tipoComprobante,
    @NotNull LocalDate fechaEmision,
    @NotNull LocalDate fechaPago,
    @NotBlank String metodoPago,
    String areaCodigo,
    String areaNombre,
    String generadoPor,
    String observacion,
    @NotEmpty List<@Valid RegistrarCobroItemRequest> items) {

  public RegistrarCobroRequest(
      Long colegiadoId,
      String tipoComprobante,
      LocalDate fechaEmision,
      String metodoPago,
      String observacion,
      List<RegistrarCobroItemRequest> items) {
    this(
        colegiadoId,
        tipoComprobante,
        fechaEmision,
        fechaEmision,
        metodoPago,
        "001",
        "Tesoreria",
        "Migracion historica",
        observacion,
        items);
  }
}
