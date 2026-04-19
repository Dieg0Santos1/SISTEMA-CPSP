package pe.cpsp.sistema.colegiados.infrastructure.persistence.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import pe.cpsp.sistema.colegiados.domain.model.PersonaExterna;

public interface PersonaExternaRepository extends JpaRepository<PersonaExterna, Long> {

  List<PersonaExterna> findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc();

  Optional<PersonaExterna> findByDni(String dni);

  boolean existsByDni(String dni);

  @Query("select p.codigoExterno from PersonaExterna p")
  List<String> findAllCodigosExternos();
}
