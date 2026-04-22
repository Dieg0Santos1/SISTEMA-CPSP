package pe.cpsp.sistema.inventario.infrastructure.persistence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.inventario.domain.model.InventarioMovimiento;

public interface InventarioMovimientoRepository extends JpaRepository<InventarioMovimiento, Long> {

  List<InventarioMovimiento> findTop5ByOrderByFechaMovimientoDesc();

  @Query(
      """
      select coalesce(sum(abs(m.cantidad)), 0)
      from InventarioMovimiento m
      where m.producto.id = :productoId and m.tipo = :tipo
      """)
  long sumAbsoluteCantidadByProductoIdAndTipo(
      @Param("productoId") Long productoId, @Param("tipo") String tipo);
}
