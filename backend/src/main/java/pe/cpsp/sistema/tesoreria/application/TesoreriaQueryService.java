package pe.cpsp.sistema.tesoreria.application;

import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.tesoreria.api.dto.ComprobanteSerieResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.TesoreriaResumenResponse;
import pe.cpsp.sistema.tesoreria.domain.model.ConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.ComprobanteSerie;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoConceptoCobro;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ComprobanteSerieRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ConceptoCobroRepository;

@Service
@Transactional(readOnly = true)
public class TesoreriaQueryService {

  private final ConceptoCobroRepository conceptoCobroRepository;
  private final ComprobanteSerieRepository comprobanteSerieRepository;

  public TesoreriaQueryService(
      ConceptoCobroRepository conceptoCobroRepository,
      ComprobanteSerieRepository comprobanteSerieRepository) {
    this.conceptoCobroRepository = conceptoCobroRepository;
    this.comprobanteSerieRepository = comprobanteSerieRepository;
  }

  public TesoreriaResumenResponse getResumen() {
    List<ConceptoCobro> conceptos = conceptoCobroRepository.findAll();
    List<ComprobanteSerieResponse> series = listSeriesActivas();

    long conceptosActivos =
        conceptos.stream().filter(concepto -> concepto.getEstado() == EstadoConceptoCobro.ACTIVO).count();
    long conceptosQueAfectanHabilitacion =
        conceptos.stream().filter(ConceptoCobro::isAfectaHabilitacion).count();
    long conceptosExoneradosIgv = conceptos.stream().filter(ConceptoCobro::isExoneradoIgv).count();

    return new TesoreriaResumenResponse(
        conceptosActivos,
        comprobanteSerieRepository.countByActivaTrue(),
        conceptosQueAfectanHabilitacion,
        conceptosExoneradosIgv,
        series);
  }

  public List<ConceptoCobroResponse> listConceptosCobro() {
    return conceptoCobroRepository.findAll().stream()
        .sorted(
            Comparator.comparing((ConceptoCobro concepto) -> concepto.getCategoria().name())
                .thenComparing(ConceptoCobro::getNombre))
        .map(this::toConceptoResponse)
        .toList();
  }

  public List<ComprobanteSerieResponse> listSeriesActivas() {
    return comprobanteSerieRepository.findByActivaTrueOrderByTipoAscSerieAsc().stream()
        .map(this::toSerieResponse)
        .toList();
  }

  private ConceptoCobroResponse toConceptoResponse(ConceptoCobro concepto) {
    return new ConceptoCobroResponse(
        concepto.getId(),
        concepto.getCodigo(),
        concepto.getNombre(),
        concepto.getCategoria().name(),
        concepto.getDescripcion(),
        concepto.getMontoBase(),
        concepto.isUsaPeriodo(),
        concepto.isPermiteCantidad(),
        concepto.isAdmiteDescuento(),
        concepto.isAdmiteMora(),
        concepto.isAfectaHabilitacion(),
        concepto.isExoneradoIgv(),
        concepto.isRequiereAdjunto(),
        concepto.getEstado().name());
  }

  private ComprobanteSerieResponse toSerieResponse(ComprobanteSerie serie) {
    return new ComprobanteSerieResponse(
        serie.getId(),
        serie.getTipo().name(),
        serie.getSerie(),
        serie.getCorrelativoActual(),
        serie.isActiva());
  }
}
