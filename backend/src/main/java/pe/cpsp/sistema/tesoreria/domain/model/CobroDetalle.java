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
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cobro_detalle")
public class CobroDetalle extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "cobro_id", nullable = false)
  private Cobro cobro;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "concepto_cobro_id", nullable = false)
  private ConceptoCobro conceptoCobro;

  @Column(name = "periodo_referencia", length = 80)
  private String periodoReferencia;

  @Column(nullable = false)
  private Integer cantidad;

  @Column(name = "monto_unitario", nullable = false, precision = 10, scale = 2)
  private BigDecimal montoUnitario;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal descuento;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal mora;

  @Column(name = "total_linea", nullable = false, precision = 10, scale = 2)
  private BigDecimal totalLinea;
}
