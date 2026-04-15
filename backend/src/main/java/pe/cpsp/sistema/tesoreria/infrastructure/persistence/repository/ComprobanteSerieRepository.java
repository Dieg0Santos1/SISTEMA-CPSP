package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;
import pe.cpsp.sistema.tesoreria.domain.model.TipoComprobante;

public interface ComprobanteSerieRepository extends JpaRepository<ComprobanteSerie, Long> {

  long countByActivaTrue();

  List<ComprobanteSerie> findByActivaTrueOrderByTipoAscSerieAsc();

  Optional<ComprobanteSerie> findByTipoAndActivaTrue(TipoComprobante tipo);
}
