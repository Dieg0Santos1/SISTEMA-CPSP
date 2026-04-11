package pe.cpsp.sistema.colegiados.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "colegiado")
public class Colegiado extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String nombre;

  @Column(name = "apellido_materno", nullable = false, length = 120)
  private String apellidoMaterno;

  @Column(name = "apellido_paterno", nullable = false, length = 120)
  private String apellidoPaterno;

  @Column(nullable = false, unique = true, length = 12)
  private String dni;

  @Column(name = "codigo_colegiatura", nullable = false, unique = true, length = 20)
  private String codigoColegiatura;

  @Column(nullable = false, length = 30)
  private String estado;

  @Column(name = "fecha_nacimiento")
  private LocalDate fechaNacimiento;

  @Column(name = "fecha_iniciacion")
  private LocalDate fechaIniciacion;

  @Column(length = 20)
  private String sexo;

  @Column(length = 255)
  private String direccion;

  @Column(length = 30)
  private String celular;

  @Column(length = 120)
  private String email;

  @Column(length = 20)
  private String ruc;

  @Column(name = "foto_url")
  private String fotoUrl;

  @ElementCollection
  @CollectionTable(
      name = "colegiado_especialidad",
      joinColumns = @JoinColumn(name = "colegiado_id", nullable = false))
  @OrderColumn(name = "orden")
  @Column(name = "nombre", nullable = false, length = 120)
  private List<String> especialidades = new ArrayList<>();
}
