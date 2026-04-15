package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CobranzaColegiadoDetailResponse(
    Long id,
    String codigoColegiatura,
    String dni,
    String nombreCompleto,
    String estado,
    LocalDate habilitadoHasta,
    LocalDate fechaUltimoPago,
    String ultimoPeriodoPagado,
    BigDecimal saldoPendienteTotal,
    boolean ceremoniaPendiente,
    int periodosPendientesCount,
    String ruc,
    List<String> especialidades,
    List<PeriodoCobranzaResponse> periodosMensuales) {}
