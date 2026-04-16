package pe.cpsp.sistema.eventos;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.eventos.api.dto.EventoCreateRequest;
import pe.cpsp.sistema.eventos.api.dto.EventoDetailResponse;
import pe.cpsp.sistema.eventos.application.EventoService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EventoServiceIntegrationTests {

  @Autowired private EventoService eventoService;

  @Test
  void createEventAndRegisterAttendance() {
    EventoDetailResponse created =
        eventoService.create(
            new EventoCreateRequest(
                "Foro de integracion profesional",
                LocalDate.of(2026, 6, 10),
                LocalTime.of(18, 45),
                "Espacio de intercambio para colegiados habilitados y nuevas comisiones."));

    EventoDetailResponse updated = eventoService.registrarAsistencia(created.id(), 1L);

    assertThat(updated.nombre()).isEqualTo("Foro de integracion profesional");
    assertThat(updated.asistenciasRegistradas()).isEqualTo(1);
    assertThat(updated.colegiados())
        .anySatisfy(
            member -> {
              assertThat(member.colegiadoId()).isEqualTo(1L);
              assertThat(member.asistio()).isTrue();
            });
  }
}
