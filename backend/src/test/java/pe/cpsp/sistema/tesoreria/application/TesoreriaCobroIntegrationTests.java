package pe.cpsp.sistema.tesoreria.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroItemRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroRequest;
import pe.cpsp.sistema.tesoreria.api.dto.RegistrarCobroResponse;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;
import pe.cpsp.sistema.tesoreria.domain.model.TipoComprobante;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ComprobanteSerieRepository;

@SpringBootTest(properties = "spring.main.allow-bean-definition-overriding=true")
@ActiveProfiles("test")
@Transactional
class TesoreriaCobroIntegrationTests {

  @Autowired private TesoreriaCobroService tesoreriaCobroService;

  @Autowired private TesoreriaQueryService tesoreriaQueryService;

  @Autowired private ColegiadoRepository colegiadoRepository;

  @Autowired private CobroRepository cobroRepository;

  @Autowired private ComprobanteSerieRepository comprobanteSerieRepository;

  @Test
  void newColegiadoStartsWithCeremonyDebtOnly() {
    Colegiado colegiado = saveColegiado("99000001", "CPL-99001", null);

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(detail.ceremoniaPendiente()).isTrue();
    assertThat(detail.estado()).isEqualTo("NO_HABILITADO");
    assertThat(detail.saldoPendienteTotal()).isEqualByComparingTo("180.00");
    assertThat(detail.periodosPendientesCount()).isZero();
    assertThat(detail.periodosMensuales()).isEmpty();
  }

  @Test
  void payingCeremonyStartsCoverageAndNextDueMonthAfterCeremonyMonth() {
    Colegiado colegiado = saveColegiado("99000002", "CPL-99002", "20111222333");
    Long ceremoniaConceptId = findConceptId("CER-JUR");

    RegistrarCobroResponse response =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "BOLETA",
                LocalDate.of(2026, 4, 13),
                "EFECTIVO",
                "Pago de ceremonia",
                List.of(
                    new RegistrarCobroItemRequest(
                        ceremoniaConceptId, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(response.tipoComprobante()).isEqualTo("BOLETA");
    assertThat(response.impreso()).isFalse();
    assertThat(detail.ceremoniaPendiente()).isFalse();
    assertThat(detail.habilitadoHasta()).isEqualTo(LocalDate.of(2026, 7, 13));
    assertThat(detail.estado()).isEqualTo("NO_HABILITADO");
    assertThat(detail.periodosMensuales()).isNotEmpty();
    assertThat(detail.periodosMensuales().get(0).periodo()).isEqualTo("2026-04");
    assertThat(detail.periodosMensuales().get(0).status()).isEqualTo("PAID");
    assertThat(detail.periodosMensuales()).hasSize(9);
    assertThat(detail.periodosPendientesCount()).isEqualTo(4);
    assertThat(detail.saldoPendienteTotal()).isEqualByComparingTo("160.00");
  }

  @Test
  void payingOldMonthlyPeriodInAugustExtendsCoverageFromActualPaymentDate() {
    Colegiado colegiado = saveColegiado("99000003", "CPL-99003", "20122333444");
    Long ceremoniaConceptId = findConceptId("CER-JUR");
    Long mensualConceptId = findConceptId("APO-MEN");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 4, 13),
            "EFECTIVO",
            "Ceremonia",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 8, 20),
            "TRANSFERENCIA",
            "Regularizacion mayo",
            List.of(
                new RegistrarCobroItemRequest(
                    mensualConceptId, "2026-05", 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(detail.estado()).isEqualTo("HABILITADO");
    assertThat(detail.habilitadoHasta()).isEqualTo(LocalDate.of(2026, 11, 20));
    assertThat(detail.ultimoPeriodoPagado()).isEqualTo("2026-05");
    assertThat(detail.saldoPendienteTotal()).isEqualByComparingTo("120.00");
    assertThat(detail.periodosPendientesCount()).isEqualTo(3);
  }

  @Test
  void facturaRequiresRegisteredRuc() {
    Colegiado colegiado = saveColegiado("99000004", "CPL-99004", null);
    Long fedateoConceptId = findConceptId("FED-DOC");

    assertThatThrownBy(
            () ->
                tesoreriaCobroService.registrarCobro(
                    new RegistrarCobroRequest(
                        colegiado.getId(),
                        "FACTURA",
                        LocalDate.of(2026, 8, 20),
                        "YAPE_PLIN",
                        "Factura sin RUC",
                        List.of(
                            new RegistrarCobroItemRequest(
                                fedateoConceptId, null, 1, BigDecimal.ZERO, BigDecimal.ZERO)))))
        .isInstanceOf(InvalidRequestException.class)
        .hasMessage("El colegiado debe tener RUC registrado para emitir factura.");
  }

  @Test
  void boletaAndFacturaSeriesAdvanceIndependently() {
    Colegiado colegiado = saveColegiado("99000005", "CPL-99005", "20133444556");
    Long ceremoniaConceptId = findConceptId("CER-JUR");
    Long fedateoConceptId = findConceptId("FED-DOC");

    ComprobanteSerie boletaSerieBefore =
        comprobanteSerieRepository.findByTipoAndActivaTrue(TipoComprobante.BOLETA).orElseThrow();
    ComprobanteSerie facturaSerieBefore =
        comprobanteSerieRepository.findByTipoAndActivaTrue(TipoComprobante.FACTURA).orElseThrow();
    long nextBoleta = boletaSerieBefore.getCorrelativoActual() + 1;
    long nextFactura = facturaSerieBefore.getCorrelativoActual() + 1;

    RegistrarCobroResponse boleta =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "BOLETA",
                LocalDate.of(2026, 8, 20),
                "EFECTIVO",
                "Ceremonia",
                List.of(
                    new RegistrarCobroItemRequest(
                        ceremoniaConceptId, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    RegistrarCobroResponse factura =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "FACTURA",
                LocalDate.of(2026, 8, 20),
                "POS_TARJETA",
                "Fedateo",
                List.of(
                    new RegistrarCobroItemRequest(
                        fedateoConceptId, null, 2, BigDecimal.ZERO, BigDecimal.ZERO))));

    ComprobanteSerie boletaSerieAfter =
        comprobanteSerieRepository.findByTipoAndActivaTrue(TipoComprobante.BOLETA).orElseThrow();
    ComprobanteSerie facturaSerieAfter =
        comprobanteSerieRepository.findByTipoAndActivaTrue(TipoComprobante.FACTURA).orElseThrow();

    assertThat(boleta.serie()).isEqualTo("B001");
    assertThat(boleta.numeroComprobante()).isEqualTo(nextBoleta);
    assertThat(factura.serie()).isEqualTo("F001");
    assertThat(factura.numeroComprobante()).isEqualTo(nextFactura);
    assertThat(boletaSerieAfter.getCorrelativoActual()).isEqualTo(nextBoleta);
    assertThat(facturaSerieAfter.getCorrelativoActual()).isEqualTo(nextFactura);
  }

  @Test
  void markingReceiptAsPrintedPersistsPrintedFlag() {
    Colegiado colegiado = saveColegiado("99000006", "CPL-99006", "20144555667");
    Long ceremoniaConceptId = findConceptId("CER-JUR");

    RegistrarCobroResponse response =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "BOLETA",
                LocalDate.of(2026, 8, 20),
                "EFECTIVO",
                "Ceremonia",
                List.of(
                    new RegistrarCobroItemRequest(
                        ceremoniaConceptId, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaCobroService.marcarImpreso(response.cobroId());

    assertThat(cobroRepository.findById(response.cobroId()).orElseThrow().isImpreso()).isTrue();
  }

  @Test
  void conceptosEndpointReturnsActiveCatalogUsedByFrontend() {
    List<ConceptoCobroResponse> conceptos = tesoreriaQueryService.listConceptosCobro();

    assertThat(conceptos).isNotEmpty();
    assertThat(conceptos).allMatch(concept -> "ACTIVO".equals(concept.estado()));
    assertThat(conceptos).anyMatch(concept -> "APO-MEN".equals(concept.codigo()) && concept.usaPeriodo());
    assertThat(conceptos).anyMatch(concept -> "CER-JUR".equals(concept.codigo()) && concept.afectaHabilitacion());
  }

  private Colegiado saveColegiado(String dni, String codigo, String ruc) {
    Colegiado colegiado = new Colegiado();
    colegiado.setNombre("Tesoreria");
    colegiado.setApellidoPaterno("Prueba");
    colegiado.setApellidoMaterno(dni.substring(dni.length() - 2));
    colegiado.setDni(dni);
    colegiado.setCodigoColegiatura(codigo);
    colegiado.setEstado("NO_HABILITADO");
    colegiado.setFechaNacimiento(LocalDate.of(1990, 1, 15));
    colegiado.setFechaIniciacion(LocalDate.of(2026, 1, 10));
    colegiado.setRuc(ruc);
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
