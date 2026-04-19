package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.Fraccionamiento;

public interface FraccionamientoRepository extends JpaRepository<Fraccionamiento, Long> {

  @Query(
      """
      select distinct fraccionamiento
      from Fraccionamiento fraccionamiento
      join fetch fraccionamiento.colegiado
      left join fetch fraccionamiento.cuotas
      left join fetch fraccionamiento.periodos
      order by fraccionamiento.id desc
      """)
  List<Fraccionamiento> findAllWithRelations();

  @Query(
      """
      select distinct fraccionamiento
      from Fraccionamiento fraccionamiento
      left join fetch fraccionamiento.cuotas
      left join fetch fraccionamiento.periodos
      where fraccionamiento.colegiado.id = :colegiadoId
      order by fraccionamiento.id desc
      """)
  List<Fraccionamiento> findAllByColegiadoIdWithRelations(Long colegiadoId);

  @Query(
      """
      select distinct fraccionamiento
      from Fraccionamiento fraccionamiento
      left join fetch fraccionamiento.cuotas
      left join fetch fraccionamiento.periodos
      where fraccionamiento.colegiado.id = :colegiadoId
        and fraccionamiento.estado = :estado
      order by fraccionamiento.id desc
      """)
  List<Fraccionamiento> findByColegiadoIdAndEstadoWithRelations(
      Long colegiadoId, EstadoFraccionamiento estado);

  @Query(
      """
      select distinct fraccionamiento
      from Fraccionamiento fraccionamiento
      join fetch fraccionamiento.colegiado
      left join fetch fraccionamiento.cuotas
      left join fetch fraccionamiento.periodos
      where fraccionamiento.id = :fraccionamientoId
      """)
  Optional<Fraccionamiento> findByIdWithRelations(Long fraccionamientoId);
}
