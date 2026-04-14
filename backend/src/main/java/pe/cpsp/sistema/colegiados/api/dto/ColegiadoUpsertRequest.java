package pe.cpsp.sistema.colegiados.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ColegiadoUpsertRequest(
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
    @NotNull(message = "La fecha de iniciacion es obligatoria.") LocalDate fechaIniciacion,
    @Size(max = 20, message = "El sexo no puede superar 20 caracteres.")
        String sexo,
    @Pattern(
            regexp = "^$|^(?:\\d\\s*){11}$",
            message = "El RUC debe contener 11 digitos numericos cuando se envia.")
        String ruc,
    @Pattern(
            regexp = "^$|^(?:\\+?51\\s*)?(?:\\d\\s*){9}$",
            message = "El celular debe tener 9 digitos y guardarse con el prefijo +51.")
        String celular,
    @Email(message = "El email debe tener un formato valido.") String email,
    @Size(max = 255, message = "La direccion no puede superar 255 caracteres.")
        String direccion,
    String fotoUrl) {}
