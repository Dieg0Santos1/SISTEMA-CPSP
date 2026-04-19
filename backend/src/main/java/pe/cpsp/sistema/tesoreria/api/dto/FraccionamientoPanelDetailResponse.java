package pe.cpsp.sistema.tesoreria.api.dto;

public record FraccionamientoPanelDetailResponse(
    Long fraccionamientoId,
    Long colegiadoId,
    String codigoColegiatura,
    String nombreCompleto,
    FraccionamientoDetailResponse detalle) {}
