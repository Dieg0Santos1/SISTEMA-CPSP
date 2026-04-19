package pe.cpsp.sistema.tesoreria.api.dto;

import java.time.LocalDate;

public record FraccionamientoListadoItemResponse(
    Long fraccionamientoId,
    Long colegiadoId,
    String codigoColegiatura,
    String nombreCompleto,
    String cuotaActual,
    LocalDate proximoPago,
    String estado,
    boolean tieneCuotaPendiente) {}
