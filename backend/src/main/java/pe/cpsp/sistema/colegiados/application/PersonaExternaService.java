package pe.cpsp.sistema.colegiados.application;

import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaResponse;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaUpsertRequest;
import pe.cpsp.sistema.colegiados.domain.model.PersonaExterna;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.ColegiadoRepository;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.PersonaExternaRepository;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.common.exception.ResourceNotFoundException;

@Service
@Transactional
public class PersonaExternaService {

  private static final String ESTADO_ACTIVO = "ACTIVO";

  private final PersonaExternaRepository personaExternaRepository;
  private final ColegiadoRepository colegiadoRepository;

  public PersonaExternaService(
      PersonaExternaRepository personaExternaRepository, ColegiadoRepository colegiadoRepository) {
    this.personaExternaRepository = personaExternaRepository;
    this.colegiadoRepository = colegiadoRepository;
  }

  @Transactional(readOnly = true)
  public List<PersonaExternaResponse> listAll() {
    return personaExternaRepository.findAllByOrderByApellidoPaternoAscApellidoMaternoAscNombreAsc()
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public PersonaExternaResponse create(PersonaExternaUpsertRequest request) {
    validateDuplicateDni(request.dni(), null);

    PersonaExterna personaExterna = new PersonaExterna();
    applyRequest(personaExterna, request);
    personaExterna.setCodigoExterno(generateNextCodigoExterno());
    personaExterna.setEstado(ESTADO_ACTIVO);

    return toResponse(personaExternaRepository.save(personaExterna));
  }

  public PersonaExternaResponse update(Long id, PersonaExternaUpsertRequest request) {
    PersonaExterna personaExterna =
        personaExternaRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el externo solicitado."));

    validateDuplicateDni(request.dni(), id);
    applyRequest(personaExterna, request);

    return toResponse(personaExternaRepository.save(personaExterna));
  }

  public void delete(Long id) {
    PersonaExterna personaExterna =
        personaExternaRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("No existe el externo solicitado."));

    personaExternaRepository.delete(personaExterna);
  }

  private void applyRequest(PersonaExterna personaExterna, PersonaExternaUpsertRequest request) {
    personaExterna.setTipoExterno(normalizeText(request.tipoExterno(), 40, "tipo de externo"));
    personaExterna.setNombre(normalizePersonName(request.nombre()));
    personaExterna.setApellidoPaterno(normalizePersonName(request.apellidoPaterno()));
    personaExterna.setApellidoMaterno(normalizePersonName(request.apellidoMaterno()));
    personaExterna.setDni(normalizeDigits(request.dni()));
    personaExterna.setFechaNacimiento(request.fechaNacimiento());
    personaExterna.setSexo(cleanNullable(request.sexo()));
    personaExterna.setCelular(normalizeCelular(request.celular()));
    personaExterna.setEmail(normalizeEmail(request.email()));
    personaExterna.setFotoUrl(cleanNullable(request.fotoUrl()));
  }

  private void validateDuplicateDni(String dni, Long currentId) {
    String normalizedDni = normalizeDigits(dni);

    if (colegiadoRepository.existsByDni(normalizedDni)) {
      throw new DuplicateResourceException(
          "Ya existe un colegiado registrado con el DNI indicado.");
    }

    personaExternaRepository
        .findByDni(normalizedDni)
        .filter(existing -> !Objects.equals(existing.getId(), currentId))
        .ifPresent(
            existing -> {
              throw new DuplicateResourceException(
                  "Ya existe un externo registrado con el DNI indicado.");
            });
  }

  private String generateNextCodigoExterno() {
    int maxNumber =
        personaExternaRepository.findAllCodigosExternos().stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(code -> code.matches("(?i)EXT-\\d+"))
            .mapToInt(code -> Integer.parseInt(code.substring(code.indexOf('-') + 1)))
            .max()
            .orElse(0);

    return "EXT-" + String.format("%05d", maxNumber + 1);
  }

  private PersonaExternaResponse toResponse(PersonaExterna personaExterna) {
    return new PersonaExternaResponse(
        personaExterna.getId(),
        personaExterna.getCodigoExterno(),
        personaExterna.getTipoExterno(),
        personaExterna.getDni(),
        personaExterna.getNombre(),
        personaExterna.getApellidoPaterno(),
        personaExterna.getApellidoMaterno(),
        buildNombreCompleto(personaExterna),
        personaExterna.getEstado(),
        personaExterna.getSexo(),
        personaExterna.getFechaNacimiento(),
        personaExterna.getCelular(),
        personaExterna.getEmail(),
        personaExterna.getFotoUrl());
  }

  private String buildNombreCompleto(PersonaExterna personaExterna) {
    return List.of(
            personaExterna.getNombre(),
            personaExterna.getApellidoPaterno(),
            personaExterna.getApellidoMaterno())
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

  private String normalizeText(String value, int maxLength, String fieldLabel) {
    String normalized = clean(value);

    if (normalized.isBlank()) {
      throw new InvalidRequestException("El " + fieldLabel + " es obligatorio.");
    }

    if (normalized.length() > maxLength) {
      throw new InvalidRequestException(
          "El " + fieldLabel + " no debe exceder " + maxLength + " caracteres.");
    }

    return normalized;
  }

  private String normalizeEmail(String value) {
    String cleaned = cleanNullable(value);
    return cleaned == null ? null : cleaned.toLowerCase();
  }

  private String normalizeDigits(String value) {
    return clean(value).replaceAll("\\D", "");
  }

  private String normalizeCelular(String value) {
    String digits = normalizeDigits(value);

    if (digits.isBlank()) {
      return null;
    }

    if (digits.startsWith("51")) {
      digits = digits.substring(2);
    }

    if (digits.length() != 9) {
      throw new InvalidRequestException(
          "El celular debe contener 9 digitos y se almacenara con el prefijo +51.");
    }

    return "+51" + digits;
  }

  private String normalizePersonName(String value) {
    String cleaned = clean(value).toLowerCase();

    if (cleaned.isBlank()) {
      return "";
    }

    StringBuilder normalized = new StringBuilder(cleaned.length());
    boolean capitalizeNext = true;

    for (char currentChar : cleaned.toCharArray()) {
      if (Character.isWhitespace(currentChar)) {
        normalized.append(' ');
        capitalizeNext = true;
      } else if (capitalizeNext) {
        normalized.append(Character.toUpperCase(currentChar));
        capitalizeNext = false;
      } else {
        normalized.append(currentChar);
      }
    }

    return normalized.toString().replaceAll("\\s+", " ").trim();
  }
}
