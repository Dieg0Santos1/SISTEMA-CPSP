package pe.cpsp.sistema.system.api;

import java.math.BigDecimal;
import java.util.List;

public record DashboardTrendResponse(
    BigDecimal total,
    BigDecimal actual,
    BigDecimal promedio,
    String mejorMesLabel,
    BigDecimal mejorMesValor,
    List<DashboardMonthlyPointResponse> monthly) {}
