package pe.cpsp.sistema.colegiados;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoUpsertRequest;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ColegiadoServiceIntegrationTests {

  @Autowired private ColegiadoService colegiadoService;

  @Autowired private ColegiadoRepository colegiadoRepository;

  @Autowired private JdbcTemplate jdbcTemplate;

  @Test
  void deleteRejectsColegiadosWithCobrosRegistrados() {
    Long colegiadoConCobros =
        colegiadoRepository.findByDni("44521098").orElseThrow().getId();

    assertThatThrownBy(() -> colegiadoService.delete(colegiadoConCobros))
        .isInstanceOf(DuplicateResourceException.class)
        .hasMessage("No se puede eliminar el colegiado porque ya tiene cobros registrados.");
  }

  @Test
  void deleteRemovesColegiadosWithoutCobros() {
    Colegiado colegiado = new Colegiado();
    colegiado.setNombre("Prueba");
    colegiado.setApellidoPaterno("SinCobros");
    colegiado.setApellidoMaterno("Temporal");
    colegiado.setDni("99887766");
    colegiado.setCodigoColegiatura("CPL-99998");
    colegiado.setEstado("NO_HABILITADO");
    colegiado.setFechaNacimiento(LocalDate.of(1992, 8, 15));

    Long colegiadoId = colegiadoRepository.saveAndFlush(colegiado).getId();

    colegiadoService.delete(colegiadoId);

    assertThat(colegiadoRepository.findById(colegiadoId)).isEmpty();
  }

  @Test
  void createNormalizesInputAndSetsDefaultStatus() {
    ColegiadoResponse created =
        colegiadoService.create(
            new ColegiadoUpsertRequest(
                "mArIa del carmen",
                "de la cRuZ",
                "quispe arAoz",
                " 1234 5678 ",
                LocalDate.of(1994, 3, 21),
                LocalDate.of(2026, 7, 15),
                "femenino",
                " 20 123456789 ",
                "999 888 777",
                "MARIA@CORREO.COM",
                "  av. los olivos 123 ",
                "data:image/png;base64," + "a".repeat(70000)));

    assertThat(created.nombre()).isEqualTo("Maria Del Carmen");
    assertThat(created.apellidoPaterno()).isEqualTo("De La Cruz");
    assertThat(created.apellidoMaterno()).isEqualTo("Quispe Araoz");
    assertThat(created.dni()).isEqualTo("12345678");
    assertThat(created.celular()).isEqualTo("+51999888777");
    assertThat(created.ruc()).isEqualTo("20123456789");
    assertThat(created.email()).isEqualTo("maria@correo.com");
    assertThat(created.estado()).isEqualTo("NO_HABILITADO");
    assertThat(created.fechaIniciacion()).isEqualTo(LocalDate.of(2026, 7, 15));
    assertThat(created.codigoColegiatura()).startsWith("CPL-");
  }

  @Test
  void colegiadoBecomesNotHabilitadoAfterThreeMonthsFromPaymentDate() {
    Colegiado colegiado = new Colegiado();
    colegiado.setNombre("Prueba");
    colegiado.setApellidoPaterno("Vigencia");
    colegiado.setApellidoMaterno("Control");
    colegiado.setDni("55667788");
    colegiado.setCodigoColegiatura("CPL-99997");
    colegiado.setEstado("HABILITADO");
    colegiado.setFechaNacimiento(LocalDate.of(1991, 4, 2));
    colegiado.setFechaIniciacion(LocalDate.now().minusMonths(1));

    Long colegiadoId = colegiadoRepository.saveAndFlush(colegiado).getId();
    LocalDate fechaPago = LocalDate.now().minusMonths(4).plusDays(1);

    jdbcTemplate.update(
        """
        INSERT INTO cobro (
            colegiado_id,
            tipo_comprobante,
            serie,
            numero_comprobante,
            origen,
            metodo_pago,
            fecha_emision,
            subtotal,
            descuento_total,
            mora_total,
            total,
            observacion,
            estado
        )
        VALUES (?, 'BOLETA', 'B001', ?, 'CAJA', 'EFECTIVO', ?, 40.00, 0.00, 0.00, 40.00, 'Prueba de vigencia', 'PAGADO')
        """,
        colegiadoId,
        99000 + colegiadoId.intValue(),
        fechaPago);

    Long cobroId =
        jdbcTemplate.queryForObject(
            """
            SELECT id
            FROM cobro
            WHERE colegiado_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            Long.class,
            colegiadoId);

    Long conceptoId =
        jdbcTemplate.queryForObject(
            "SELECT id FROM concepto_cobro WHERE codigo = 'APO-MEN'",
            Long.class);

    jdbcTemplate.update(
        """
        INSERT INTO cobro_detalle (
            cobro_id,
            concepto_cobro_id,
            periodo_referencia,
            cantidad,
            monto_unitario,
            descuento,
            mora,
            total_linea
        )
        VALUES (?, ?, ?, 1, 40.00, 0.00, 0.00, 40.00)
        """,
        cobroId,
        conceptoId,
        fechaPago.withDayOfMonth(1).toString().substring(0, 7));

    ColegiadoResponse response = colegiadoService.getById(colegiadoId);

    assertThat(response.estado()).isEqualTo("NO_HABILITADO");
    assertThat(response.habilitadoHasta()).isEqualTo(fechaPago.plusMonths(3));
    assertThat(response.ultimaCuotaPeriodo()).isEqualTo(fechaPago.toString());
  }
}
