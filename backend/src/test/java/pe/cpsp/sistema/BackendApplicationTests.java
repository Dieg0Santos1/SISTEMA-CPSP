package pe.cpsp.sistema;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void contextLoads() {
	}

	@Test
	void colegiadoTableUsesExpectedColumns() {
		List<String> columnNames =
				jdbcTemplate.queryForList(
						"""
						SELECT COLUMN_NAME
						FROM INFORMATION_SCHEMA.COLUMNS
						WHERE TABLE_NAME = 'COLEGIADO'
						ORDER BY ORDINAL_POSITION
						""",
						String.class);

		assertThat(columnNames)
				.contains(
						"ID",
						"DNI",
						"ESTADO",
						"EMAIL",
						"NOMBRE",
						"APELLIDO_MATERNO",
						"APELLIDO_PATERNO",
						"CODIGO_COLEGIATURA",
						"FECHA_NACIMIENTO",
						"FECHA_INICIACION",
						"SEXO",
						"DIRECCION",
						"CELULAR",
						"RUC",
						"FOTO_URL")
				.doesNotContain("CODIGO", "NOMBRES", "APELLIDOS", "TELEFONO");

		Integer totalMigratedRows =
				jdbcTemplate.queryForObject(
						"""
						SELECT COUNT(*)
						FROM colegiado
						WHERE nombre IS NOT NULL
						  AND apellido_materno IS NOT NULL
						  AND apellido_paterno IS NOT NULL
						  AND codigo_colegiatura IS NOT NULL
						""",
						Integer.class);

		assertThat(totalMigratedRows).isEqualTo(3);
	}

	@Test
	void colegiadoSeedPaymentsSupportHabilitacionRule() {
		Integer totalPagosQueAfectanHabilitacion =
				jdbcTemplate.queryForObject(
						"""
						SELECT COUNT(*)
						FROM cobro_detalle detalle
						INNER JOIN concepto_cobro concepto
						  ON concepto.id = detalle.concepto_cobro_id
						WHERE concepto.afecta_habilitacion = TRUE
						""",
						Integer.class);

		assertThat(totalPagosQueAfectanHabilitacion).isEqualTo(2);
	}

	@Test
	void colegiadoEspecialidadesSeededForDetailViews() {
		Integer totalEspecialidades =
				jdbcTemplate.queryForObject(
						"""
						SELECT COUNT(*)
						FROM colegiado_especialidad
						""",
						Integer.class);

		assertThat(totalEspecialidades).isEqualTo(4);
	}

}
