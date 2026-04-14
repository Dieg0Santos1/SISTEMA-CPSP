package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.tesoreria.domain.model.Cobro;

public interface CobroRepository extends JpaRepository<Cobro, Long> {

  boolean existsByColegiadoId(Long colegiadoId);

  @Query(
      """
      select distinct cobro
      from Cobro cobro
      join fetch cobro.colegiado colegiado
      left join fetch cobro.detalles detalle
      left join fetch detalle.conceptoCobro concepto
      """)
  List<Cobro> findAllWithDetails();

  @Query(
      """
      select distinct cobro
      from Cobro cobro
      join fetch cobro.colegiado colegiado
      left join fetch cobro.detalles detalle
      left join fetch detalle.conceptoCobro concepto
      where cobro.id = :id
      """)
  Optional<Cobro> findByIdWithDetails(Long id);
}
