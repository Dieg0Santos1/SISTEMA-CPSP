package pe.cpsp.sistema.eventos.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.eventos.domain.model.Evento;

public interface EventoRepository extends JpaRepository<Evento, Long> {

  @EntityGraph(attributePaths = "asistencias")
  List<Evento> findAllByOrderByFechaHoraAsc();

  @EntityGraph(attributePaths = "asistencias")
  Optional<Evento> findById(Long id);
}
