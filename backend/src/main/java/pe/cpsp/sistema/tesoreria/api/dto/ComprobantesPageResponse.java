package pe.cpsp.sistema.tesoreria.api.dto;

import java.util.List;

public record ComprobantesPageResponse(
    long boletasEmitidas,
    long facturasEmitidas,
    long noImpresas,
    List<ComprobanteSerieResponse> seriesActivas,
    PagedResponse<ComprobanteListadoResponse> rows) {}
