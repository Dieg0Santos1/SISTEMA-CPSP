package pe.cpsp.sistema.tesoreria.domain.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fraccionamiento")
public class Fraccionamiento extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "colegiado_id", nullable = false)
  private Colegiado colegiado;

  @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
  private BigDecimal montoTotal;

  @Column(name = "numero_cuotas", nullable = false)
  private Integer numeroCuotas;

  @Column(name = "fecha_inicio", nullable = false)
  private LocalDate fechaInicio;

  @Column(length = 255)
  private String observacion;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EstadoFraccionamiento estado;

  @OneToMany(mappedBy = "fraccionamiento", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<FraccionamientoCuota> cuotas = new LinkedHashSet<>();

  @OneToMany(mappedBy = "fraccionamiento", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<FraccionamientoPeriodo> periodos = new LinkedHashSet<>();
}
