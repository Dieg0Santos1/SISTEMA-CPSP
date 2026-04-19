package pe.cpsp.sistema.tesoreria.api.dto;

public record ConceptoCobroDeleteResponse(
    Long conceptoId,
    String resultado,
    String estadoFinal,
    String mensaje) {}
