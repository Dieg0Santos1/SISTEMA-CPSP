package pe.cpsp.sistema.tesoreria.api.dto;

public record ComprobanteSerieResponse(
    Long id, String tipo, String serie, Long correlativoActual, boolean activa) {}
