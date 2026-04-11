package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;

public interface CobroRepository extends JpaRepository<Cobro, Long> {

  boolean existsByColegiadoId(Long colegiadoId);
}
