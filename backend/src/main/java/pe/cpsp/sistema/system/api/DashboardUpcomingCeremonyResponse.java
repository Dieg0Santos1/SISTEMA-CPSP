package pe.cpsp.sistema.system.api;

import java.time.LocalDate;

public record DashboardUpcomingCeremonyResponse(
    Long colegiadoId,
    String codigo,
    String dni,
    String nombreCompleto,
    String especialidad,
    LocalDate fechaTentativa) {}
