package pe.cpsp.sistema.system.application;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaItemRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaRequest;
import pe.cpsp.sistema.inventario.application.InventarioService;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroItemRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroRequest;
import pe.cpsp.sistema.tesoreria.application.TesoreriaCobroService;
import pe.cpsp.sistema.tesoreria.application.TesoreriaQueryService;

@SpringBootTest(properties = "spring.main.allow-bean-definition-overriding=true")
@ActiveProfiles("test")
@Transactional
class DashboardServiceIntegrationTests {

  @Autowired private DashboardService dashboardService;
  @Autowired private TesoreriaCobroService tesoreriaCobroService;
  @Autowired private TesoreriaQueryService tesoreriaQueryService;
  @Autowired private InventarioService inventarioService;
  @Autowired private ColegiadoRepository colegiadoRepository;

  @Test
  void overviewReturnsRealMetricsAndMonthlySeries() {
    Colegiado colegiadoJulio = saveColegiado("99110001", "CPL-99101", LocalDate.of(2026, 7, 4));
    Colegiado colegiadoAgosto = saveColegiado("99110002", "CPL-99102", LocalDate.of(2026, 8, 8));

    Long ceremoniaConceptId = findConceptId("CER-JUR");
    Long aportacionConceptId = findConceptId("APO-MEN");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiadoAgosto.getId(),
            "BOLETA",
            LocalDate.of(2026, 8, 12),
            "EFECTIVO",
            "Ceremonia dashboard",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiadoAgosto.getId(),
            "BOLETA",
            LocalDate.of(2026, 8, 15),
            "TRANSFERENCIA",
            "Aportacion dashboard",
            List.of(
                new RegistrarCobroItemRequest(
                    aportacionConceptId, null, "2026-09", 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    inventarioService.registrarVenta(
        new InventarioRegistrarVentaRequest(
            "COLEGIADO",
            1L,
            "EFECTIVO",
            LocalDate.of(2026, 8, 18),
            "Venta dashboard",
            List.of(new InventarioRegistrarVentaItemRequest(1L, 1))));

    var overview = dashboardService.getOverview();

    assertThat(overview.totalColegiados()).isPositive();
    assertThat(overview.habilitados()).isPositive();
    assertThat(overview.inactivos()).isPositive();
    assertThat(overview.ingresosMensuales()).isGreaterThan(BigDecimal.ZERO);
    assertThat(overview.mesActualLabel()).isEqualTo("AGO");
    assertThat(overview.colegiados().monthly()).hasSize(12);
    assertThat(overview.aportaciones().monthly()).hasSize(12);
    assertThat(overview.colegiados().monthly())
        .filteredOn(point -> "JUL".equals(point.label()))
        .singleElement()
        .satisfies(
            point -> {
              assertThat(point.value()).isGreaterThanOrEqualTo(BigDecimal.ONE);
            });
    assertThat(overview.colegiados().monthly())
        .filteredOn(point -> "AGO".equals(point.label()))
        .singleElement()
        .satisfies(point -> assertThat(point.value()).isGreaterThanOrEqualTo(BigDecimal.ONE));
    assertThat(overview.aportaciones().monthly())
        .filteredOn(point -> "AGO".equals(point.label()))
        .singleElement()
        .satisfies(point -> assertThat(point.value()).isGreaterThanOrEqualTo(new BigDecimal("40.00")));
  }

  private Colegiado saveColegiado(String dni, String codigo, LocalDate fechaIniciacion) {
    Colegiado colegiado = new Colegiado();
    colegiado.setNombre("Dashboard");
    colegiado.setApellidoPaterno("Prueba");
    colegiado.setApellidoMaterno(dni.substring(dni.length() - 2));
    colegiado.setDni(dni);
    colegiado.setCodigoColegiatura(codigo);
    colegiado.setEstado("NO_HABILITADO");
    colegiado.setFechaNacimiento(LocalDate.of(1991, 2, 14));
    colegiado.setFechaIniciacion(fechaIniciacion);
    return colegiadoRepository.saveAndFlush(colegiado);
  }

  private Long findConceptId(String codigo) {
    return tesoreriaQueryService.listConceptosCobro().stream()
        .filter(concepto -> codigo.equals(concepto.codigo()))
        .findFirst()
        .map(ConceptoCobroResponse::id)
        .orElseThrow();
  }

  @TestConfiguration
  static class FixedClockConfig {
    @Bean
    @Primary
    Clock appClock() {
      return Clock.fixed(
          Instant.parse("2026-08-20T15:00:00Z"),
          ZoneId.of("America/Lima"));
    }
  }
}
