package pe.cpsp.sistema.colegiados;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
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
}
