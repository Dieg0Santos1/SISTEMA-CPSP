package pe.cpsp.sistema.tesoreria.api.dto;

import java.util.List;

public record ConceptoCobroCatalogoResponse(
    List<ConceptoCobroResponse> conceptos,
    long activos,
    long categorias,
    long afectanHabilitacion,
    long exoneradosIgv) {}
