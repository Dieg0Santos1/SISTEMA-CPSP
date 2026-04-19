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
@Table(name = "inventario_venta")
public class InventarioVenta extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 20)
  private String referencia;

  @Column(length = 20)
  private String serie;

  @Column(name = "numero_comprobante")
  private Long numeroComprobante;

  @Column(name = "cliente_tipo", nullable = false, length = 20)
  private String clienteTipo;

  @Column(name = "cliente_referencia_id", nullable = false)
  private Long clienteReferenciaId;

  @Column(name = "cliente_codigo", nullable = false, length = 40)
  private String clienteCodigo;

  @Column(name = "cliente_nombre", nullable = false, length = 220)
  private String clienteNombre;

  @Column(name = "cliente_documento", nullable = false, length = 20)
  private String clienteDocumento;

  @Column(name = "cliente_detalle", length = 120)
  private String clienteDetalle;

  @Column(name = "metodo_pago", nullable = false, length = 30)
  private String metodoPago;

  @Column(length = 255)
  private String observacion;

  @Column(name = "fecha_venta", nullable = false)
  private LocalDate fechaVenta;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal total;

  @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<InventarioVentaDetalle> detalles = new ArrayList<>();
}
