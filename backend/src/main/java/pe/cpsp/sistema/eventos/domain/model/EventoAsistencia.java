package pe.cpsp.sistema.eventos.domain.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.domain.model.PersonaExterna;
import pe.cpsp.sistema.common.persistence.AuditableEntity;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "evento_asistencia")
public class EventoAsistencia extends AuditableEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "evento_id", nullable = false)
  private Evento evento;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "colegiado_id")
  private Colegiado colegiado;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "persona_externa_id")
  private PersonaExterna personaExterna;
}
