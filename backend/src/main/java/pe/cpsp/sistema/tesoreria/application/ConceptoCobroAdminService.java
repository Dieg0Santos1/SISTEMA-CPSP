package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroResponse;
import pe.cpsp.sistema.tesoreria.api.dto.ConceptoCobroUpsertRequest;
import pe.cpsp.sistema.tesoreria.domain.model.CategoriaConcepto;
import pe.cpsp.sistema.tesoreria.domain.model.ConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoConceptoCobro;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroDetalleRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ConceptoCobroRepository;

@Service
@Transactional
public class ConceptoCobroAdminService {

  private final ConceptoCobroRepository conceptoCobroRepository;
  private final CobroDetalleRepository cobroDetalleRepository;

  public ConceptoCobroAdminService(
      ConceptoCobroRepository conceptoCobroRepository,
      CobroDetalleRepository cobroDetalleRepository) {
    this.conceptoCobroRepository = conceptoCobroRepository;
    this.cobroDetalleRepository = cobroDetalleRepository;
  }

  public ConceptoCobroResponse crear(ConceptoCobroUpsertRequest request) {
    String codigo = normalizeCode(request.codigo());
    if (conceptoCobroRepository.existsByCodigoIgnoreCase(codigo)) {
      throw new DuplicateResourceException("Ya existe un concepto con ese codigo.");
    }

    ConceptoCobro concepto = new ConceptoCobro();
    applyRequest(concepto, request, codigo);
    return toResponse(conceptoCobroRepository.save(concepto));
  }

  public ConceptoCobroResponse actualizar(Long conceptoId, ConceptoCobroUpsertRequest request) {
    ConceptoCobro concepto =
        conceptoCobroRepository
            .findById(conceptoId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto solicitado."));

    String codigo = normalizeCode(request.codigo());
    conceptoCobroRepository
        .findByCodigo(codigo)
        .filter(existing -> !existing.getId().equals(conceptoId))
        .ifPresent(ignored -> {
          throw new DuplicateResourceException("Ya existe un concepto con ese codigo.");
        });

    applyRequest(concepto, request, codigo);
    return toResponse(conceptoCobroRepository.save(concepto));
  }

  public void eliminar(Long conceptoId) {
    ConceptoCobro concepto =
        conceptoCobroRepository
            .findById(conceptoId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto solicitado."));

    if (cobroDetalleRepository.existsByConceptoCobroId(conceptoId)) {
      concepto.setEstado(EstadoConceptoCobro.INACTIVO);
      conceptoCobroRepository.save(concepto);
      return;
    }

    conceptoCobroRepository.delete(concepto);
  }

  private void applyRequest(
      ConceptoCobro concepto, ConceptoCobroUpsertRequest request, String normalizedCode) {
    concepto.setCodigo(normalizedCode);
    concepto.setNombre(normalizeText(request.nombre(), 120, "nombre"));
    concepto.setCategoria(parseCategoria(request.categoria()));
    concepto.setDescripcion(normalizeNullableText(request.descripcion(), 255));
    concepto.setMontoBase(normalizeAmount(request.montoBase()));
    concepto.setUsaPeriodo(request.usaPeriodo());
    concepto.setPermiteCantidad(request.permiteCantidad());
    concepto.setAdmiteDescuento(request.admiteDescuento());
    concepto.setAdmiteMora(request.admiteMora());
    concepto.setAfectaHabilitacion(request.afectaHabilitacion());
    concepto.setExoneradoIgv(request.exoneradoIgv());
    concepto.setRequiereAdjunto(request.requiereAdjunto());
    concepto.setEstado(parseEstado(request.estado()));
  }

  private String normalizeCode(String codigo) {
    String normalized = normalizeText(codigo, 30, "codigo").toUpperCase(Locale.ROOT);
    if (normalized.contains(" ")) {
      throw new InvalidRequestException("El codigo no debe contener espacios.");
    }
    return normalized;
  }

  private String normalizeText(String value, int maxLength, String fieldLabel) {
    if (value == null || value.trim().isEmpty()) {
      throw new InvalidRequestException("El " + fieldLabel + " es obligatorio.");
    }

    String normalized = value.trim();
    if (normalized.length() > maxLength) {
      throw new InvalidRequestException(
          "El " + fieldLabel + " no debe exceder " + maxLength + " caracteres.");
    }
    return normalized;
  }

  private String normalizeNullableText(String value, int maxLength) {
    if (value == null) {
      return null;
    }
    String normalized = value.trim();
    if (normalized.isEmpty()) {
      return null;
    }
    if (normalized.length() > maxLength) {
      throw new InvalidRequestException(
          "La descripcion no debe exceder " + maxLength + " caracteres.");
    }
    return normalized;
  }

  private BigDecimal normalizeAmount(BigDecimal amount) {
    if (amount == null) {
      throw new InvalidRequestException("El monto base es obligatorio.");
    }
    if (amount.compareTo(BigDecimal.ZERO) < 0) {
      throw new InvalidRequestException("El monto base no puede ser negativo.");
    }
    return amount.setScale(2, RoundingMode.HALF_UP);
  }

  private CategoriaConcepto parseCategoria(String value) {
    try {
      return CategoriaConcepto.valueOf(normalizeEnum(value));
    } catch (IllegalArgumentException exception) {
      throw new InvalidRequestException("La categoria seleccionada no es valida.");
    }
  }

  private EstadoConceptoCobro parseEstado(String value) {
    try {
      return EstadoConceptoCobro.valueOf(normalizeEnum(value));
    } catch (IllegalArgumentException exception) {
      throw new InvalidRequestException("El estado seleccionado no es valido.");
    }
  }

  private String normalizeEnum(String value) {
    if (value == null || value.trim().isEmpty()) {
      throw new InvalidRequestException("La opcion seleccionada es obligatoria.");
    }
    return value.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
  }

  private ConceptoCobroResponse toResponse(ConceptoCobro concepto) {
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
}
