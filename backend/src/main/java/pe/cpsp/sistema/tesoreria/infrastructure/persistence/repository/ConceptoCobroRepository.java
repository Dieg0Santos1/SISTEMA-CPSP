package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.tesoreria.domain.model.ConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoConceptoCobro;

public interface ConceptoCobroRepository extends JpaRepository<ConceptoCobro, Long> {

  long countByEstado(EstadoConceptoCobro estado);
}
