package pe.cpsp.sistema.tesoreria.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
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
import java.util.ArrayList;
import java.util.List;
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

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_comprobante", nullable = false, length = 40)
  private TipoComprobante tipoComprobante;

  @Column(nullable = false, length = 20)
  private String serie;

  @Column(name = "numero_comprobante", nullable = false)
  private Long numeroComprobante;

  @Column(nullable = false, length = 40)
  private String origen;

  @Enumerated(EnumType.STRING)
  @Column(name = "metodo_pago", nullable = false, length = 40)
  private MetodoPago metodoPago;

  @Column(name = "fecha_emision", nullable = false)
  private LocalDate fechaEmision;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal subtotal;

  @Column(name = "descuento_total", nullable = false, precision = 10, scale = 2)
  private BigDecimal descuentoTotal;

  @Column(name = "mora_total", nullable = false, precision = 10, scale = 2)
  private BigDecimal moraTotal;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal total;

  @Column(length = 255)
  private String observacion;

  @Column(nullable = false, length = 30)
  private String estado;

  @Column(nullable = false)
  private boolean impreso;

  @OneToMany(mappedBy = "cobro", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<CobroDetalle> detalles = new ArrayList<>();
}
