package pe.cpsp.sistema.colegiados.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ColegiadoEspecialidadesRequest(
    @Size(max = 3, message = "Solo se permiten hasta 3 especialidades.")
        List<
                @NotBlank(message = "La especialidad no puede estar vacia.")
                @Size(max = 120, message = "Cada especialidad no puede superar 120 caracteres.")
                String>
            especialidades) {}
