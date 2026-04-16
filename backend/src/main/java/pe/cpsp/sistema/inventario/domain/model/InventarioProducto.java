package pe.cpsp.sistema.inventario.domain.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
@Table(name = "inventario_producto")
public class InventarioProducto extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 40)
  private String codigo;

  @Column(nullable = false, length = 160)
  private String nombre;

  @Column(nullable = false, length = 80)
  private String categoria;

  @Column(length = 600)
  private String descripcion;

  @Column(name = "precio_referencia", nullable = false, precision = 10, scale = 2)
  private BigDecimal precioReferencia;

  @Column(name = "stock_actual", nullable = false)
  private Integer stockActual;

  @Column(nullable = false)
  private boolean activo;

  @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<InventarioEntrega> entregas = new ArrayList<>();
}
