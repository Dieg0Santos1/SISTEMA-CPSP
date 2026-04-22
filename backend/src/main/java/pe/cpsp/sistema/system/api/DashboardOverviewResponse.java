package pe.cpsp.sistema.system.api;

import java.math.BigDecimal;
import java.util.List;

public record DashboardOverviewResponse(
    long totalColegiados,
    BigDecimal variacionAltasVsMesAnterior,
    long habilitados,
    long habilitadosPorcentaje,
    long inactivos,
    long inactivosPorcentaje,
    BigDecimal ingresosMensuales,
    String mesActualLabel,
    int anioActual,
    DashboardTrendResponse colegiados,
    DashboardTrendResponse aportaciones,
    List<DashboardRecentActivityResponse> recentActivity,
    List<DashboardUpcomingCeremonyResponse> upcomingCeremonies) {}
