package pe.cpsp.sistema.colegiados.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;

public interface ColegiadoRepository extends JpaRepository<Colegiado, Long> {

  List<Colegiado> findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc();

  Optional<Colegiado> findByDni(String dni);

  Optional<Colegiado> findByCodigoColegiatura(String codigoColegiatura);

  boolean existsByDni(String dni);

  boolean existsByCodigoColegiatura(String codigoColegiatura);

  @Query("select c.codigoColegiatura from Colegiado c")
  List<String> findAllCodigosColegiatura();
}
