package pe.cpsp.sistema.tesoreria.domain.model;

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
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "fraccionamiento_cuota")
public class FraccionamientoCuota extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fraccionamiento_id", nullable = false)
  private Fraccionamiento fraccionamiento;

  @Column(name = "numero_cuota", nullable = false)
  private Integer numeroCuota;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal monto;

  @Column(name = "fecha_vencimiento", nullable = false)
  private LocalDate fechaVencimiento;

  @Column(name = "fecha_pago")
  private LocalDate fechaPago;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EstadoFraccionamientoCuota estado;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cobro_detalle_id")
  private CobroDetalle cobroDetalle;
}
