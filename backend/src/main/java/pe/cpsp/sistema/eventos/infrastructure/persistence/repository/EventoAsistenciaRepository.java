package pe.cpsp.sistema.eventos.infrastructure.persistence.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.eventos.domain.model.EventoAsistencia;

public interface EventoAsistenciaRepository extends JpaRepository<EventoAsistencia, Long> {

  Optional<EventoAsistencia> findByEventoIdAndColegiadoId(Long eventoId, Long colegiadoId);

  Optional<EventoAsistencia> findByEventoIdAndPersonaExternaId(Long eventoId, Long personaExternaId);
}
