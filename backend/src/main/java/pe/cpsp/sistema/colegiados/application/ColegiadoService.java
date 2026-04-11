package pe.cpsp.sistema.colegiados.application;

import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoResponse;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoEspecialidadesRequest;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoUpsertRequest;
import pe.cpsp.sistema.colegiados.domain.model.Colegiado;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;
import pe.cpsp.sistema.tesoreria.domain.model.CobroDetalle;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroRepository;
import pe.cpsp.sistema.tesoreria.infrastructure.persistence.repository.CobroDetalleRepository;

@Service
@Transactional
public class ColegiadoService {

  private static final String ESTADO_HABILITADO = "HABILITADO";
  private static final String ESTADO_NO_HABILITADO = "NO_HABILITADO";

  private final ColegiadoRepository colegiadoRepository;
  private final CobroRepository cobroRepository;
  private final CobroDetalleRepository cobroDetalleRepository;
  private final Clock appClock;

  public ColegiadoService(
      ColegiadoRepository colegiadoRepository,
      CobroRepository cobroRepository,
      CobroDetalleRepository cobroDetalleRepository,
      Clock appClock) {
    this.colegiadoRepository = colegiadoRepository;
    this.cobroRepository = cobroRepository;
    this.cobroDetalleRepository = cobroDetalleRepository;
    this.appClock = appClock;
  }

  @Transactional(readOnly = true)
  public List<ColegiadoResponse> listAll() {
    Map<Long, HabilitacionInfo> habilitacionPorColegiado = buildHabilitacionMap();

    return colegiadoRepository.findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc().stream()
        .map(colegiado -> toResponse(colegiado, habilitacionPorColegiado.get(colegiado.getId())))
        .toList();
  }

  @Transactional(readOnly = true)
  public ColegiadoResponse getById(Long id) {
    Colegiado colegiado =
        colegiadoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));

    return toResponse(colegiado, buildHabilitacionMap().get(colegiado.getId()));
  }

  @Transactional(readOnly = true)
  public ColegiadoResponse getByDni(String dni) {
    Colegiado colegiado =
        colegiadoRepository
            .findByDni(dni)
            .orElseThrow(
                () -> new ResourceNotFoundException("No existe un colegiado con el DNI indicado."));

    return toResponse(colegiado, buildHabilitacionMap().get(colegiado.getId()));
  }

  @Transactional(readOnly = true)
  public ColegiadoResponse getByCodigo(String codigoColegiatura) {
    Colegiado colegiado =
        colegiadoRepository
            .findByCodigoColegiatura(codigoColegiatura)
            .orElseThrow(
                () ->
                    new ResourceNotFoundException(
                        "No existe un colegiado con el codigo de colegiatura indicado."));

    return toResponse(colegiado, buildHabilitacionMap().get(colegiado.getId()));
  }

  public ColegiadoResponse create(ColegiadoUpsertRequest request) {
    validateDuplicateDni(request.dni(), null);

    Colegiado colegiado = new Colegiado();
    applyRequest(colegiado, request);
    colegiado.setCodigoColegiatura(generateNextCodigoColegiatura());
    colegiado.setEstado(ESTADO_NO_HABILITADO);

    Colegiado saved = colegiadoRepository.save(colegiado);
    return toResponse(saved, null);
  }

  public ColegiadoResponse update(Long id, ColegiadoUpsertRequest request) {
    Colegiado colegiado =
        colegiadoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));

    validateDuplicateDni(request.dni(), id);

    applyRequest(colegiado, request);

    Colegiado saved = colegiadoRepository.save(colegiado);
    return toResponse(saved, buildHabilitacionMap().get(saved.getId()));
  }

  public void delete(Long id) {
    Colegiado colegiado =
        colegiadoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));

    if (cobroRepository.existsByColegiadoId(colegiado.getId())) {
      throw new DuplicateResourceException(
          "No se puede eliminar el colegiado porque ya tiene cobros registrados.");
    }

    colegiadoRepository.delete(colegiado);
  }

  public ColegiadoResponse updateEspecialidades(Long id, ColegiadoEspecialidadesRequest request) {
    Colegiado colegiado =
        colegiadoRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el colegiado solicitado."));

    List<String> especialidades =
        request.especialidades() == null
            ? List.of()
            : request.especialidades().stream()
                .map(this::clean)
                .filter(value -> !value.isBlank())
                .limit(3)
                .toList();

    colegiado.setEspecialidades(new ArrayList<>(especialidades));

    Colegiado saved = colegiadoRepository.save(colegiado);
    return toResponse(saved, buildHabilitacionMap().get(saved.getId()));
  }

  private void applyRequest(Colegiado colegiado, ColegiadoUpsertRequest request) {
    colegiado.setNombre(clean(request.nombre()));
    colegiado.setApellidoPaterno(clean(request.apellidoPaterno()));
    colegiado.setApellidoMaterno(clean(request.apellidoMaterno()));
    colegiado.setDni(clean(request.dni()));
    colegiado.setFechaNacimiento(request.fechaNacimiento());
    colegiado.setSexo(cleanNullable(request.sexo()));
    colegiado.setRuc(cleanNullable(request.ruc()));
    colegiado.setCelular(cleanNullable(request.celular()));
    colegiado.setEmail(cleanNullable(request.email()));
    colegiado.setDireccion(cleanNullable(request.direccion()));
    colegiado.setFotoUrl(cleanNullable(request.fotoUrl()));
  }

  private void validateDuplicateDni(String dni, Long currentId) {
    colegiadoRepository
        .findByDni(clean(dni))
        .filter(existing -> !Objects.equals(existing.getId(), currentId))
        .ifPresent(
            existing -> {
              throw new DuplicateResourceException(
                  "Ya existe un colegiado registrado con el DNI indicado.");
            });
  }

  private String generateNextCodigoColegiatura() {
    int maxNumber =
        colegiadoRepository.findAllCodigosColegiatura().stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(code -> code.matches("(?i)CPL-\\d+"))
            .mapToInt(code -> Integer.parseInt(code.substring(code.indexOf('-') + 1)))
            .max()
            .orElse(0);

    return "CPL-" + String.format("%05d", maxNumber + 1);
  }

  private Map<Long, HabilitacionInfo> buildHabilitacionMap() {
    Map<Long, HabilitacionInfo> latestByColegiado = new LinkedHashMap<>();

    for (CobroDetalle detalle : cobroDetalleRepository.findPagosQueAfectanHabilitacion()) {
      Long colegiadoId = detalle.getCobro().getColegiado().getId();
      latestByColegiado.computeIfAbsent(colegiadoId, ignored -> toHabilitacionInfo(detalle));
    }

    return latestByColegiado;
  }

  private HabilitacionInfo toHabilitacionInfo(CobroDetalle detalle) {
    LocalDate periodoBase = resolvePeriodoBase(detalle);
    LocalDate habilitadoHasta = periodoBase.plusMonths(4).minusDays(1);
    boolean habilitado = !LocalDate.now(appClock).isAfter(habilitadoHasta);

    return new HabilitacionInfo(periodoBase, habilitadoHasta, habilitado);
  }

  private LocalDate resolvePeriodoBase(CobroDetalle detalle) {
    String periodoReferencia = detalle.getPeriodoReferencia();

    if (periodoReferencia != null && !periodoReferencia.isBlank()) {
      try {
        return YearMonth.parse(periodoReferencia.trim()).atDay(1);
      } catch (DateTimeParseException ignored) {
        try {
          return LocalDate.parse(periodoReferencia.trim()).withDayOfMonth(1);
        } catch (DateTimeParseException ignoredAgain) {
          // Fallback a fecha de emision cuando el formato del periodo no es mensual.
        }
      }
    }

    return detalle.getCobro().getFechaEmision().withDayOfMonth(1);
  }

  private ColegiadoResponse toResponse(Colegiado colegiado, HabilitacionInfo habilitacionInfo) {
    String estadoActual =
        habilitacionInfo != null
            ? (habilitacionInfo.habilitado() ? ESTADO_HABILITADO : ESTADO_NO_HABILITADO)
            : normalizeLegacyEstado(colegiado.getEstado());

    return new ColegiadoResponse(
        colegiado.getId(),
        colegiado.getCodigoColegiatura(),
        colegiado.getDni(),
        colegiado.getNombre(),
        colegiado.getApellidoPaterno(),
        colegiado.getApellidoMaterno(),
        buildNombreCompleto(colegiado),
        estadoActual,
        colegiado.getSexo(),
        colegiado.getFechaNacimiento(),
        colegiado.getFechaIniciacion(),
        colegiado.getDireccion(),
        colegiado.getCelular(),
        colegiado.getEmail(),
        colegiado.getRuc(),
        colegiado.getFotoUrl(),
        List.copyOf(colegiado.getEspecialidades()),
        habilitacionInfo != null ? habilitacionInfo.periodoBase().toString() : null,
        habilitacionInfo != null ? habilitacionInfo.habilitadoHasta() : null);
  }

  private String normalizeLegacyEstado(String estado) {
    if (estado == null || estado.isBlank()) {
      return ESTADO_NO_HABILITADO;
    }

    return switch (estado.trim().toUpperCase()) {
      case "HABILITADO", "HABILITADA", "ACTIVO", "ACTIVA" -> ESTADO_HABILITADO;
      default -> ESTADO_NO_HABILITADO;
    };
  }

  private String buildNombreCompleto(Colegiado colegiado) {
    return List.of(colegiado.getNombre(), colegiado.getApellidoPaterno(), colegiado.getApellidoMaterno())
        .stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(value -> !value.isBlank())
        .reduce((left, right) -> left + " " + right)
        .orElse("");
  }

  private String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private String cleanNullable(String value) {
    String cleaned = clean(value);
    return cleaned.isBlank() ? null : cleaned;
  }

  private record HabilitacionInfo(
      LocalDate periodoBase, LocalDate habilitadoHasta, boolean habilitado) {}
}
