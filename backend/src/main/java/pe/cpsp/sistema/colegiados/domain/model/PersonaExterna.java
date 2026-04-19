package pe.cpsp.sistema.colegiados.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "persona_externa")
public class PersonaExterna extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "codigo_externo", nullable = false, unique = true, length = 20)
  private String codigoExterno;

  @Column(name = "tipo_externo", nullable = false, length = 40)
  private String tipoExterno;

  @Column(nullable = false, length = 120)
  private String nombre;

  @Column(name = "apellido_paterno", nullable = false, length = 120)
  private String apellidoPaterno;

  @Column(name = "apellido_materno", nullable = false, length = 120)
  private String apellidoMaterno;

  @Column(nullable = false, unique = true, length = 12)
  private String dni;

  @Column(name = "fecha_nacimiento")
  private LocalDate fechaNacimiento;

  @Column(length = 20)
  private String sexo;

  @Column(length = 30)
  private String celular;

  @Column(length = 120)
  private String email;

  @Column(name = "foto_url")
  private String fotoUrl;

  @Column(nullable = false, length = 20)
  private String estado;
}
