package pe.cpsp.sistema.inventario.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "inventario_movimiento")
public class InventarioMovimiento extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "producto_id", nullable = false)
  private InventarioProducto producto;

  @Column(nullable = false, length = 40)
  private String tipo;

  @Column(nullable = false, length = 255)
  private String detalle;

  @Column(nullable = false)
  private Integer cantidad;

  @Column(name = "fecha_movimiento", nullable = false)
  private LocalDateTime fechaMovimiento;
}
