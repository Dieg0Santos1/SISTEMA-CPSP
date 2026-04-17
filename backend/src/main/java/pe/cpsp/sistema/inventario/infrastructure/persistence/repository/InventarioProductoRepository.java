package pe.cpsp.sistema.inventario.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.inventario.domain.model.InventarioProducto;

public interface InventarioProductoRepository extends JpaRepository<InventarioProducto, Long> {

  @EntityGraph(attributePaths = "entregas")
  List<InventarioProducto> findAllByActivoTrueOrderByNombreAsc();

  @EntityGraph(attributePaths = "entregas")
  Optional<InventarioProducto> findByIdAndActivoTrue(Long id);

  boolean existsByCodigoIgnoreCase(String codigo);
}
