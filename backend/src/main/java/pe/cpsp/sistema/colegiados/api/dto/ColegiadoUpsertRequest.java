package pe.cpsp.sistema.colegiados.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
        @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 digitos numericos.")
        String dni,
    @Past(message = "La fecha de nacimiento debe ser una fecha valida del pasado.")
        LocalDate fechaNacimiento,
    @Size(max = 20, message = "El sexo no puede superar 20 caracteres.")
        String sexo,
    @Pattern(
            regexp = "^$|\\d{11}",
            message = "El RUC debe contener 11 digitos numericos cuando se envia.")
        String ruc,
    @Size(max = 30, message = "El celular no puede superar 30 caracteres.")
        String celular,
    @Email(message = "El email debe tener un formato valido.") String email,
    @Size(max = 255, message = "La direccion no puede superar 255 caracteres.")
        String direccion,
    String fotoUrl) {}
