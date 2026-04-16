package pe.cpsp.sistema.inventario.infrastructure.persistence.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.inventario.domain.model.InventarioEntrega;

public interface InventarioEntregaRepository extends JpaRepository<InventarioEntrega, Long> {

  Optional<InventarioEntrega> findByProductoIdAndColegiadoId(Long productoId, Long colegiadoId);
}
