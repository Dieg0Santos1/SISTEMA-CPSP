package pe.cpsp.sistema.colegiados.api.dto;

import java.time.LocalDate;
import java.util.List;

public record ColegiadoResponse(
    Long id,
    String codigoColegiatura,
    String dni,
    String nombre,
    String apellidoPaterno,
    String apellidoMaterno,
    String nombreCompleto,
    String estado,
    String sexo,
    LocalDate fechaNacimiento,
    LocalDate fechaIniciacion,
    String direccion,
    String celular,
    String email,
    String ruc,
    String fotoUrl,
    List<String> especialidades,
    String ultimaCuotaPeriodo,
    LocalDate habilitadoHasta) {}
