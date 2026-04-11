package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;

public interface CobroDetalleRepository extends JpaRepository<CobroDetalle, Long> {

  @Query(
      """
      select detalle
      from CobroDetalle detalle
      join fetch detalle.cobro cobro
      join fetch cobro.colegiado colegiado
      join fetch detalle.conceptoCobro concepto
      where concepto.afectaHabilitacion = true
      order by cobro.fechaEmision desc, detalle.id desc
      """)
  List<CobroDetalle> findPagosQueAfectanHabilitacion();
}
