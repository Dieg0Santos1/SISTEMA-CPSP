package pe.cpsp.sistema.tesoreria.api.dto;

public record PeriodoCobranzaResponse(
    String periodo,
    String label,
    String status,
    boolean selectable) {}
