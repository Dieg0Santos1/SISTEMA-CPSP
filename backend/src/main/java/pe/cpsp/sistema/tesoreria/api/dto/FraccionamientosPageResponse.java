package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;

public record FraccionamientosPageResponse(
    long totalFraccionamientos,
    long conveniosActivos,
    BigDecimal montoTotalRefinanciado,
    BigDecimal saldoPendienteTotal,
    PagedResponse<FraccionamientoListadoItemResponse> rows) {}
