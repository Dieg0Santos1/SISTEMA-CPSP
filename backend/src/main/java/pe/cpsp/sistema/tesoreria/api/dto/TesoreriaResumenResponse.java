package pe.cpsp.sistema.tesoreria.api.dto;

import java.util.List;

public record TesoreriaResumenResponse(
    long conceptosActivos,
    long seriesActivas,
    long conceptosQueAfectanHabilitacion,
    long conceptosExoneradosIgv,
    List<ComprobanteSerieResponse> seriesDisponibles) {}
