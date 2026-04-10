package pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;

public interface ComprobanteSerieRepository extends JpaRepository<ComprobanteSerie, Long> {

  long countByActivaTrue();

  List<ComprobanteSerie> findByActivaTrueOrderByTipoAscSerieAsc();
}
