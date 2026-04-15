package pe.cpsp.sistema.tesoreria.api.dto;

public record CobranzaColegiadoListItemResponse(
    Long id,
    String codigoColegiatura,
    String dni,
    String nombreCompleto,
    String estado) {}
