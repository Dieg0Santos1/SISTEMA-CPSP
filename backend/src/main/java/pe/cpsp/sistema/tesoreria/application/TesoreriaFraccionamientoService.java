package pe.cpsp.sistema.tesoreria.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.tesoreria.api.dto.CrearFraccionamientoRequest;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoCuotaResponse;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoDetailResponse;
import pe.cpsp.sistema.tesoreria.domain.model.ConceptoCobro;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.EstadoFraccionamientoCuota;
import pe.cpsp.sistema.tesoreria.domain.model.Fraccionamiento;
import pe.cpsp.sistema.tesoreria.domain.model.FraccionamientoCuota;
import pe.cpsp.sistema.tesoreria.domain.model.FraccionamientoPeriodo;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.ConceptoCobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.FraccionamientoRepository;

@Service
@Transactional
public class TesoreriaFraccionamientoService {

  private final ColegiadoRepository colegiadoRepository;
  private final CobroRepository cobroRepository;
  private final ConceptoCobroRepository conceptoCobroRepository;
  private final FraccionamientoRepository fraccionamientoRepository;
  private final TesoreriaSupport tesoreriaSupport;
  private final Clock appClock;

  public TesoreriaFraccionamientoService(
      ColegiadoRepository colegiadoRepository,
      CobroRepository cobroRepository,
      ConceptoCobroRepository conceptoCobroRepository,
      FraccionamientoRepository fraccionamientoRepository,
      TesoreriaSupport tesoreriaSupport,
      Clock appClock) {
    this.colegiadoRepository = colegiadoRepository;
    this.cobroRepository = cobroRepository;
    this.conceptoCobroRepository = conceptoCobroRepository;
    this.fraccionamientoRepository = fraccionamientoRepository;
    this.tesoreriaSupport = tesoreriaSupport;
    this.appClock = appClock;
  }

  public FraccionamientoDetailResponse crear(Long colegiadoId, CrearFraccionamientoRequest request) {
    Colegiado colegiado =
        colegiadoRepository
            .findById(colegiadoId)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));

    if (!fraccionamientoRepository.findByColegiadoIdAndEstadoWithRelations(
            colegiadoId, EstadoFraccionamiento.ACTIVO)
        .isEmpty()) {
      throw new InvalidRequestException("El colegiado ya tiene un fraccionamiento activo.");
    }

    ConceptoCobro ceremoniaConcept =
        conceptoCobroRepository
            .findByCodigo(TesoreriaSupport.CODIGO_CEREMONIA)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto ceremonia."));
    ConceptoCobro aportacionConcept =
        conceptoCobroRepository
            .findByCodigo(TesoreriaSupport.CODIGO_APORTACION_MENSUAL)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el concepto de aportacion."));

    LocalDate today = request.fechaInicio() != null ? request.fechaInicio() : LocalDate.now(appClock);
    TesoreriaSupport.CobranzaProfile profile =
        tesoreriaSupport.buildProfile(
            colegiado,
            cobroRepository.findAllWithDetails().stream()
                .filter(cobro -> colegiadoId.equals(cobro.getColegiado().getId()))
                .toList(),
            List.of(),
            today,
            ceremoniaConcept.getMontoBase(),
            aportacionConcept.getMontoBase());

    if (profile.ceremoniaPendiente()) {
      throw new InvalidRequestException(
          "Primero debe pagarse la ceremonia antes de crear un fraccionamiento.");
    }

    if (profile.periodosPendientes().isEmpty()) {
      throw new InvalidRequestException("No hay periodos pendientes para fraccionar.");
    }

    if (request.numeroCuotas() == null || request.numeroCuotas() < 2) {
      throw new InvalidRequestException("El fraccionamiento debe tener al menos 2 cuotas.");
    }

    Fraccionamiento fraccionamiento = new Fraccionamiento();
    fraccionamiento.setColegiado(colegiado);
    fraccionamiento.setMontoTotal(profile.montoFraccionable());
    fraccionamiento.setNumeroCuotas(request.numeroCuotas());
    fraccionamiento.setFechaInicio(today);
    fraccionamiento.setObservacion(cleanNullable(request.observacion()));
    fraccionamiento.setEstado(EstadoFraccionamiento.ACTIVO);

    profile.periodosPendientes().forEach(
        periodo -> {
          FraccionamientoPeriodo fraccionamientoPeriodo = new FraccionamientoPeriodo();
          fraccionamientoPeriodo.setFraccionamiento(fraccionamiento);
          fraccionamientoPeriodo.setPeriodoReferencia(periodo.toString());
          fraccionamiento.getPeriodos().add(fraccionamientoPeriodo);
        });

    for (int index = 0; index < request.numeroCuotas(); index++) {
      FraccionamientoCuota cuota = new FraccionamientoCuota();
      cuota.setFraccionamiento(fraccionamiento);
      cuota.setNumeroCuota(index + 1);
      cuota.setMonto(calculateInstallmentAmount(profile.montoFraccionable(), request.numeroCuotas(), index));
      cuota.setFechaVencimiento(today.plusMonths(index));
      cuota.setEstado(EstadoFraccionamientoCuota.PENDIENTE);
      fraccionamiento.getCuotas().add(cuota);
    }

    Fraccionamiento saved = fraccionamientoRepository.save(fraccionamiento);
    return toResponse(saved);
  }

  private BigDecimal calculateInstallmentAmount(
      BigDecimal totalAmount, int totalInstallments, int installmentIndex) {
    BigDecimal regularAmount =
        totalAmount.divide(BigDecimal.valueOf(totalInstallments), 2, RoundingMode.DOWN);

    if (installmentIndex < totalInstallments - 1) {
      return regularAmount;
    }

    BigDecimal accumulated =
        regularAmount.multiply(BigDecimal.valueOf(totalInstallments - 1L));
    return totalAmount.subtract(accumulated).setScale(2, RoundingMode.HALF_UP);
  }

  private FraccionamientoDetailResponse toResponse(Fraccionamiento fraccionamiento) {
    List<FraccionamientoCuotaResponse> cuotas = new ArrayList<>();
    BigDecimal saldoPendiente = BigDecimal.ZERO;
    int cuotasPagadas = 0;
    FraccionamientoCuotaResponse siguienteCuota = null;

    for (FraccionamientoCuota cuota : fraccionamiento.getCuotas().stream()
        .sorted(java.util.Comparator.comparing(FraccionamientoCuota::getNumeroCuota))
        .toList()) {
      FraccionamientoCuotaResponse cuotaResponse =
          new FraccionamientoCuotaResponse(
              cuota.getId(),
              cuota.getNumeroCuota(),
              cuota.getMonto(),
              cuota.getFechaVencimiento(),
              cuota.getEstado().name(),
              cuota.getEstado() == EstadoFraccionamientoCuota.PAGADA);
      cuotas.add(cuotaResponse);

      if (cuota.getEstado() == EstadoFraccionamientoCuota.PAGADA) {
        cuotasPagadas++;
      } else {
        saldoPendiente = saldoPendiente.add(cuota.getMonto());
        if (siguienteCuota == null) {
          siguienteCuota = cuotaResponse;
        }
      }
    }

    return new FraccionamientoDetailResponse(
        fraccionamiento.getId(),
        fraccionamiento.getEstado().name(),
        fraccionamiento.getMontoTotal(),
        saldoPendiente,
        fraccionamiento.getNumeroCuotas(),
        cuotasPagadas,
        fraccionamiento.getNumeroCuotas() - cuotasPagadas,
        fraccionamiento.getFechaInicio(),
        fraccionamiento.getObservacion(),
        fraccionamiento.getPeriodos().stream()
            .map(FraccionamientoPeriodo::getPeriodoReferencia)
            .sorted()
            .toList(),
        cuotas,
        siguienteCuota);
  }

  private String cleanNullable(String value) {
    if (value == null) {
      return null;
    }
    String normalized = value.trim();
    return normalized.isBlank() ? null : normalized;
  }
}
