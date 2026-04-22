package pe.cpsp.sistema.system.api;

import java.time.LocalDateTime;

public record DashboardRecentActivityResponse(
    String tipo,
    String title,
    String detail,
    LocalDateTime timestamp) {}
