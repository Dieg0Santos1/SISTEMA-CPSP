package pe.cpsp.sistema.inventario.infrastructure.persistence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.inventario.domain.model.InventarioVenta;

public interface InventarioVentaRepository extends JpaRepository<InventarioVenta, Long> {

  @EntityGraph(attributePaths = {"detalles", "detalles.producto"})
  List<InventarioVenta> findAllByOrderByFechaVentaDescIdDesc();
}
