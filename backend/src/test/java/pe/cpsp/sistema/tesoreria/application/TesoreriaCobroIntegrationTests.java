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
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroDeleteResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroCatalogoResponse;
import pe.cpsp.sistema.tesoreria.api.dto.CobranzaColegiadoDetailResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroUpsertRequest;
import pe.cpsp.sistema.tesoreria.api.dto.CrearFraccionamientoRequest;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientosPageResponse;
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

  @Autowired private TesoreriaFraccionamientoService tesoreriaFraccionamientoService;

  @Autowired private ConceptoCobroAdminService conceptoCobroAdminService;

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
                        ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(response.tipoComprobante()).isEqualTo("BOLETA");
    assertThat(response.impreso()).isFalse();
    assertThat(detail.ceremoniaPendiente()).isFalse();
    assertThat(detail.habilitadoHasta()).isEqualTo(LocalDate.of(2026, 7, 13));
    assertThat(detail.estado()).isEqualTo("NO_HABILITADO");
    assertThat(detail.periodosMensuales()).isNotEmpty();
    assertThat(detail.periodosMensuales().get(0).periodo()).isEqualTo("2026-01");
    assertThat(detail.periodosMensuales().get(0).status()).isEqualTo("NOT_APPLICABLE");
    assertThat(detail.periodosMensuales()).hasSize(36);
    assertThat(detail.periodosMensuales())
        .anySatisfy(periodo -> {
          assertThat(periodo.periodo()).isEqualTo("2026-04");
          assertThat(periodo.status()).isEqualTo("PAID");
          assertThat(periodo.selectable()).isFalse();
        });
    assertThat(detail.periodosMensuales())
        .anySatisfy(periodo -> {
          assertThat(periodo.periodo()).isEqualTo("2028-12");
          assertThat(periodo.status()).isEqualTo("UPCOMING");
          assertThat(periodo.selectable()).isTrue();
        });
    assertThat(detail.periodosPendientesCount()).isEqualTo(4);
    assertThat(detail.saldoPendienteTotal()).isEqualByComparingTo("160.00");
  }

  @Test
  void canRegisterAdvanceMonthlyPaymentsIntoNextYear() {
    Colegiado colegiado = saveColegiado("99000010", "CPL-99010", "20188999001");
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
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    RegistrarCobroResponse response =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "BOLETA",
                LocalDate.of(2026, 8, 20),
                "TRANSFERENCIA",
                "Pago adelantado de 12 meses",
                List.of(
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-05", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-06", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-07", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-08", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-09", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-10", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-11", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2026-12", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2027-01", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2027-02", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2027-03", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        mensualConceptId, null, "2027-04", 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(response.items()).hasSize(12);
    assertThat(response.total()).isEqualByComparingTo("480.00");
    assertThat(response.items()).anyMatch(item -> "2027-04".equals(item.periodoReferencia()));
    assertThat(detail.ultimoPeriodoPagado()).isEqualTo("2027-04");
  }

  @Test
  void timelineDoesNotExposeYearsBeforeCeremonyYear() {
    Colegiado colegiado = saveColegiado("99000011", "CPL-99011", "20199000112");
    Long ceremoniaConceptId = findConceptId("CER-JUR");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2024, 3, 10),
            "EFECTIVO",
            "Ceremonia",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(detail.periodosMensuales()).isNotEmpty();
    assertThat(detail.periodosMensuales().get(0).periodo()).isEqualTo("2024-01");
    assertThat(detail.periodosMensuales())
        .noneMatch(periodo -> periodo.periodo().startsWith("2023-"));
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
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 8, 20),
            "TRANSFERENCIA",
            "Regularizacion mayo",
            List.of(
                new RegistrarCobroItemRequest(
                    mensualConceptId, null, "2026-05", 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(detail.estado()).isEqualTo("HABILITADO");
    assertThat(detail.habilitadoHasta()).isEqualTo(LocalDate.of(2026, 11, 20));
    assertThat(detail.ultimoPeriodoPagado()).isEqualTo("2026-05");
    assertThat(detail.saldoPendienteTotal()).isEqualByComparingTo("120.00");
    assertThat(detail.periodosPendientesCount()).isEqualTo(3);
  }

  @Test
  void gracePeriodsFollowLastPaidMonthForProjectedTimeline() {
    Colegiado colegiado = saveColegiado("99000009", "CPL-99009", "20177888990");
    Long ceremoniaConceptId = findConceptId("CER-JUR");
    Long mensualConceptId = findConceptId("APO-MEN");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 4, 17),
            "EFECTIVO",
            "Ceremonia",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 4, 17),
            "TRANSFERENCIA",
            "Pago adelantado hasta junio",
            List.of(
                new RegistrarCobroItemRequest(
                    mensualConceptId, null, "2026-05", 1, BigDecimal.ZERO, BigDecimal.ZERO),
                new RegistrarCobroItemRequest(
                    mensualConceptId, null, "2026-06", 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(detail.ultimoPeriodoPagado()).isEqualTo("2026-06");
    assertThat(detail.periodosMensuales())
        .filteredOn(periodo -> List.of("2026-07", "2026-08", "2026-09").contains(periodo.periodo()))
        .allSatisfy(periodo -> assertThat(periodo.status()).isEqualTo("GRACE"));
  }

  @Test
  void creatingFractionationMovesHistoricalDebtIntoInstallments() {
    Colegiado colegiado = saveColegiado("99000007", "CPL-99007", "20155666778");
    Long ceremoniaConceptId = findConceptId("CER-JUR");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 4, 13),
            "EFECTIVO",
            "Ceremonia",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaFraccionamientoService.crear(
        colegiado.getId(),
        new CrearFraccionamientoRequest(LocalDate.of(2026, 8, 20), 4, "Acuerdo por deuda historica"));

    CobranzaColegiadoDetailResponse detail =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(detail.fraccionamientoActivo()).isNotNull();
    assertThat(detail.fraccionamientoActivo().numeroCuotas()).isEqualTo(4);
    assertThat(detail.fraccionamientoActivo().periodosIncluidos())
        .containsExactly("2026-05", "2026-06", "2026-07", "2026-08");
    assertThat(detail.periodosPendientesCount()).isZero();
    assertThat(detail.montoFraccionable()).isEqualByComparingTo("0.00");
    assertThat(detail.saldoPendienteTotal()).isEqualByComparingTo("160.00");
    assertThat(detail.periodosMensuales())
        .filteredOn(periodo -> "2026-05".equals(periodo.periodo()))
        .singleElement()
        .satisfies(periodo -> {
          assertThat(periodo.status()).isEqualTo("REFINANCED");
          assertThat(periodo.selectable()).isFalse();
        });
  }

  @Test
  void payingInstallmentMarksQuotaAsPaidAndKeepsOtherQuotasPending() {
    Colegiado colegiado = saveColegiado("99000008", "CPL-99008", "20166777889");
    Long ceremoniaConceptId = findConceptId("CER-JUR");
    Long fedateoConceptId = findConceptId("FED-DOC");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 4, 13),
            "EFECTIVO",
            "Ceremonia",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    tesoreriaFraccionamientoService.crear(
        colegiado.getId(),
        new CrearFraccionamientoRequest(LocalDate.of(2026, 8, 20), 4, "Convenio en cuotas"));

    CobranzaColegiadoDetailResponse beforePayment =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    RegistrarCobroResponse response =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "BOLETA",
                LocalDate.of(2026, 8, 20),
                "TRANSFERENCIA",
                "Primera cuota y fedateo",
                List.of(
                    new RegistrarCobroItemRequest(
                        null,
                        beforePayment.fraccionamientoActivo().siguienteCuota().id(),
                        null,
                        1,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        fedateoConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    CobranzaColegiadoDetailResponse afterPayment =
        tesoreriaQueryService.getColegiadoCobranza(colegiado.getId());

    assertThat(response.items())
        .anyMatch(item -> "FRAC-CUO".equals(item.codigoConcepto()) && "Cuota 1/4".equals(item.periodoReferencia()));
    assertThat(afterPayment.fraccionamientoActivo()).isNotNull();
    assertThat(afterPayment.fraccionamientoActivo().cuotasPagadas()).isEqualTo(1);
    assertThat(afterPayment.fraccionamientoActivo().cuotasPendientes()).isEqualTo(3);
    assertThat(afterPayment.fraccionamientoActivo().siguienteCuota().numeroCuota()).isEqualTo(2);
    assertThat(afterPayment.saldoPendienteTotal()).isEqualByComparingTo("120.00");
  }

  @Test
  void fraccionamientosPageReturnsSummaryAndRowsForDashboard() {
    Colegiado colegiado = saveColegiado("99000012", "CPL-99012", "20112344321");
    Long ceremoniaConceptId = findConceptId("CER-JUR");

    tesoreriaCobroService.registrarCobro(
        new RegistrarCobroRequest(
            colegiado.getId(),
            "BOLETA",
            LocalDate.of(2026, 4, 13),
            "EFECTIVO",
            "Ceremonia",
            List.of(
                new RegistrarCobroItemRequest(
                    ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

    var detail =
        tesoreriaFraccionamientoService.crear(
            colegiado.getId(),
            new CrearFraccionamientoRequest(LocalDate.of(2026, 8, 20), 4, "Convenio dashboard"));

    FraccionamientosPageResponse response = tesoreriaQueryService.getFraccionamientos("", 1, 10);
    var detallePanel = tesoreriaQueryService.getFraccionamientoDetail(detail.id());

    assertThat(response.totalFraccionamientos()).isPositive();
    assertThat(response.conveniosActivos()).isPositive();
    assertThat(response.montoTotalRefinanciado()).isGreaterThan(BigDecimal.ZERO);
    assertThat(response.rows().content())
        .anySatisfy(
            row -> {
              assertThat(row.codigoColegiatura()).isEqualTo("CPL-99012");
              assertThat(row.cuotaActual()).isEqualTo("Cuota 1/4");
              assertThat(row.proximoPago()).isEqualTo(LocalDate.of(2026, 8, 20));
            });
    assertThat(detallePanel.codigoColegiatura()).isEqualTo("CPL-99012");
    assertThat(detallePanel.detalle().numeroCuotas()).isEqualTo(4);
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
                                fedateoConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO)))))
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
                        ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

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
                        fedateoConceptId, null, null, 2, BigDecimal.ZERO, BigDecimal.ZERO))));

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
                        ceremoniaConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO))));

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

  @Test
  void catalogoEndpointReturnsAllConceptsAndSummary() {
    ConceptoCobroCatalogoResponse catalogo = tesoreriaQueryService.getConceptosCobroCatalogo();

    assertThat(catalogo.conceptos()).isNotEmpty();
    assertThat(catalogo.activos()).isPositive();
    assertThat(catalogo.categorias()).isPositive();
  }

  @Test
  void createUpdateAndDeleteConceptsPersistCorrectly() {
    ConceptoCobroResponse created =
        conceptoCobroAdminService.crear(
            new ConceptoCobroUpsertRequest(
                "SER-TEST",
                "NORMAL",
                "Servicio de prueba",
                "Servicios",
                "Concepto temporal para pruebas",
                new BigDecimal("55.00"),
                null,
                null,
                null,
                false,
                true,
                true,
                false,
                false,
                false,
                false,
                "ACTIVO"));

    assertThat(created.codigo()).isEqualTo("SER-TEST");
    assertThat(created.categoria()).isEqualTo("SERVICIOS");

    ConceptoCobroResponse updated =
        conceptoCobroAdminService.actualizar(
            created.id(),
            new ConceptoCobroUpsertRequest(
                "SER-TEST",
                "NORMAL",
                "Servicio de prueba editado",
                "Certificaciones",
                "Concepto actualizado",
                new BigDecimal("65.50"),
                null,
                null,
                null,
                false,
                true,
                false,
                false,
                false,
                true,
                true,
                "INACTIVO"));

    assertThat(updated.nombre()).isEqualTo("Servicio de prueba editado");
    assertThat(updated.categoria()).isEqualTo("CERTIFICACIONES");
    assertThat(updated.exoneradoIgv()).isTrue();
    assertThat(updated.estado()).isEqualTo("INACTIVO");

    ConceptoCobroDeleteResponse deleteResponse = conceptoCobroAdminService.eliminar(created.id());

    assertThat(deleteResponse.resultado()).isEqualTo("ELIMINADO");

    assertThat(tesoreriaQueryService.getConceptosCobroCatalogo().conceptos())
        .noneMatch(concepto -> created.id().equals(concepto.id()));
  }

  @Test
  void createDiscountConceptPersistsSpecificConfiguration() {
    ConceptoCobroResponse created =
        conceptoCobroAdminService.crear(
            new ConceptoCobroUpsertRequest(
                "DSC-APO",
                "DESCUENTO",
                "Descuento por pronto pago",
                null,
                "Se aplica al pagar varias aportaciones juntas",
                null,
                "PORCENTAJE",
                new BigDecimal("10.00"),
                "APORTACIONES",
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                "ACTIVO"));

    assertThat(created.tipoConcepto()).isEqualTo("DESCUENTO");
    assertThat(created.categoria()).isEqualTo("DESCUENTOS");
    assertThat(created.tipoDescuento()).isEqualTo("PORCENTAJE");
    assertThat(created.valorDescuento()).isEqualByComparingTo("10.00");
    assertThat(created.aplicaDescuentoA()).isEqualTo("APORTACIONES");
    assertThat(tesoreriaQueryService.listConceptosCobro())
        .anyMatch(concepto -> "DSC-APO".equals(concepto.codigo()));
    assertThat(tesoreriaQueryService.getConceptosCobroCatalogo().descuentosConfigurados())
        .isPositive();
  }

  @Test
  void registeringDiscountConceptAppliesNegativeLineToReceipt() {
    Colegiado colegiado = saveColegiado("99000013", "CPL-99013", "20177444111");

    ConceptoCobroResponse discountConcept =
        conceptoCobroAdminService.crear(
            new ConceptoCobroUpsertRequest(
                "DSC-FIX",
                "DESCUENTO",
                "Descuento promocional",
                null,
                "Monto fijo de prueba",
                null,
                "MONTO_FIJO",
                new BigDecimal("5.00"),
                "TODOS_LOS_CONCEPTOS",
                false,
                false,
                false,
                false,
                false,
                false,
                false,
                "ACTIVO"));

    Long fedateoConceptId = findConceptId("FED-DOC");

    RegistrarCobroResponse response =
        tesoreriaCobroService.registrarCobro(
            new RegistrarCobroRequest(
                colegiado.getId(),
                "BOLETA",
                LocalDate.of(2026, 8, 20),
                "EFECTIVO",
                "Fedateo con descuento",
                List.of(
                    new RegistrarCobroItemRequest(
                        fedateoConceptId, null, null, 1, BigDecimal.ZERO, BigDecimal.ZERO),
                    new RegistrarCobroItemRequest(
                        discountConcept.id(),
                        null,
                        "S/ 5.00 sobre todos los conceptos",
                        1,
                        new BigDecimal("5.00"),
                        BigDecimal.ZERO))));

    assertThat(response.subtotal()).isEqualByComparingTo("12.00");
    assertThat(response.descuentoTotal()).isEqualByComparingTo("5.00");
    assertThat(response.total()).isEqualByComparingTo("7.00");
    assertThat(response.items())
        .anySatisfy(
            item -> {
              assertThat(item.codigoConcepto()).isEqualTo("DSC-FIX");
              assertThat(item.totalLinea()).isEqualByComparingTo("-5.00");
            });
  }

  @Test
  void deletingReferencedConceptMarksItInactive() {
    Long ceremonyConceptId = findConceptId("CER-JUR");

    ConceptoCobroDeleteResponse deleteResponse =
        conceptoCobroAdminService.eliminar(ceremonyConceptId);

    assertThat(deleteResponse.resultado()).isEqualTo("INACTIVADO");

    ConceptoCobroResponse concepto =
        tesoreriaQueryService.getConceptosCobroCatalogo().conceptos().stream()
            .filter(item -> ceremonyConceptId.equals(item.id()))
            .findFirst()
            .orElseThrow();

    assertThat(concepto.estado()).isEqualTo("INACTIVO");
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
