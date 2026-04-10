package pe.cpsp.sistema.tesoreria.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "concepto_cobro")
public class ConceptoCobro extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 30)
  private String codigo;

  @Column(nullable = false, length = 120)
  private String nombre;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 40)
  private CategoriaConcepto categoria;

  @Column(length = 255)
  private String descripcion;

  @Column(name = "monto_base", nullable = false, precision = 10, scale = 2)
  private BigDecimal montoBase;

  @Column(name = "usa_periodo", nullable = false)
  private boolean usaPeriodo;

  @Column(name = "permite_cantidad", nullable = false)
  private boolean permiteCantidad;

  @Column(name = "admite_descuento", nullable = false)
  private boolean admiteDescuento;

  @Column(name = "admite_mora", nullable = false)
  private boolean admiteMora;

  @Column(name = "afecta_habilitacion", nullable = false)
  private boolean afectaHabilitacion;

  @Column(name = "exonerado_igv", nullable = false)
  private boolean exoneradoIgv;

  @Column(name = "requiere_adjunto", nullable = false)
  private boolean requiereAdjunto;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private EstadoConceptoCobro estado;
}
