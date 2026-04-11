package pe.cpsp.sistema.tesoreria.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cobro")
public class Cobro extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "colegiado_id", nullable = false)
  private Colegiado colegiado;

  @Column(name = "fecha_emision", nullable = false)
  private LocalDate fechaEmision;
}
