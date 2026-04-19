package pe.cpsp.sistema.colegiados.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record PersonaExternaUpsertRequest(
    @NotBlank(message = "El tipo de externo es obligatorio.")
        @Size(max = 40, message = "El tipo de externo no puede superar 40 caracteres.")
        String tipoExterno,
    @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no puede superar 120 caracteres.")
        String nombre,
    @NotBlank(message = "El apellido paterno es obligatorio.")
        @Size(max = 120, message = "El apellido paterno no puede superar 120 caracteres.")
        String apellidoPaterno,
    @NotBlank(message = "El apellido materno es obligatorio.")
        @Size(max = 120, message = "El apellido materno no puede superar 120 caracteres.")
        String apellidoMaterno,
    @NotBlank(message = "El DNI es obligatorio.")
        @Pattern(
            regexp = "^(?:\\d\\s*){8}$",
            message = "El DNI debe tener 8 digitos numericos.")
        String dni,
    @Past(message = "La fecha de nacimiento debe ser una fecha valida del pasado.")
        LocalDate fechaNacimiento,
    @Size(max = 20, message = "El sexo no puede superar 20 caracteres.")
        String sexo,
    @Pattern(
            regexp = "^$|^(?:\\+?51\\s*)?(?:\\d\\s*){9}$",
            message = "El celular debe tener 9 digitos y guardarse con el prefijo +51.")
        String celular,
    @Email(message = "El email debe tener un formato valido.") String email,
    String fotoUrl) {}
