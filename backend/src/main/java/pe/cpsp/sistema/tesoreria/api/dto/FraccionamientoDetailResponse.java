package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FraccionamientoDetailResponse(
    Long id,
    String estado,
    BigDecimal montoTotal,
    BigDecimal saldoPendiente,
    int numeroCuotas,
    int cuotasPagadas,
    int cuotasPendientes,
    LocalDate fechaInicio,
    String observacion,
    List<String> periodosIncluidos,
    List<FraccionamientoCuotaResponse> cuotas,
    FraccionamientoCuotaResponse siguienteCuota) {}
