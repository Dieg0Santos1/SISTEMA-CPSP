package pe.cpsp.sistema.colegiados.api.dto;

import java.time.LocalDate;

public record PersonaExternaResponse(
    Long id,
    String codigoExterno,
    String tipoExterno,
    String dni,
    String nombre,
    String apellidoPaterno,
    String apellidoMaterno,
    String nombreCompleto,
    String estado,
    String sexo,
    LocalDate fechaNacimiento,
    String celular,
    String email,
    String fotoUrl) {}
