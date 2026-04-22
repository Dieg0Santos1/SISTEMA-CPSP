package pe.cpsp.sistema.inventario.infrastructure.persistence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.inventario.domain.model.InventarioVenta;

public interface InventarioVentaRepository extends JpaRepository<InventarioVenta, Long> {

  @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
  List<InventarioVenta> findAllByOrderByFechaVentaDescIdDesc();

  @Query(
      """
      select distinct venta
      from InventarioVenta venta
      left join fetch venta.detalles detalle
      left join fetch detalle.producto producto
      where venta.id = :id
      """)
  java.util.Optional<InventarioVenta> findByIdWithDetails(Long id);
}
