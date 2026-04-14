package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;

public record HistorialPageResponse(
    BigDecimal totalHoy,
    long operacionesHoy,
    BigDecimal totalUltimosSieteDias,
    long operacionesUltimosSieteDias,
    BigDecimal ticketPromedio,
    PagedResponse<OperacionTesoreriaResponse> rows) {}
