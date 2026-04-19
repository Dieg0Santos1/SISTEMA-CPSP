package pe.cpsp.sistema.colegiados;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.api.dto.ColegiadoUpsertRequest;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaResponse;
import pe.cpsp.sistema.colegiados.api.dto.PersonaExternaUpsertRequest;
import pe.cpsp.sistema.colegiados.application.ColegiadoService;
import pe.cpsp.sistema.colegiados.application.PersonaExternaService;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PersonaExternaServiceIntegrationTests {

  @Autowired private PersonaExternaService personaExternaService;

  @Autowired private ColegiadoService colegiadoService;

  @Test
  void createExternalNormalizesInputAndGeneratesCode() {
    PersonaExternaResponse created =
        personaExternaService.create(
            new PersonaExternaUpsertRequest(
                "estudiante universitario",
                "laura",
                "del rio",
                "quispe",
                " 7766 5544 ",
                LocalDate.of(2002, 9, 3),
                "femenino",
                "999 111 222",
                "LAURA@CORREO.COM",
                "data:image/png;base64," + "b".repeat(500)));

    assertThat(created.tipoExterno()).isEqualTo("estudiante universitario");
    assertThat(created.nombre()).isEqualTo("Laura");
    assertThat(created.apellidoPaterno()).isEqualTo("Del Rio");
    assertThat(created.apellidoMaterno()).isEqualTo("Quispe");
    assertThat(created.dni()).isEqualTo("77665544");
    assertThat(created.celular()).isEqualTo("+51999111222");
    assertThat(created.email()).isEqualTo("laura@correo.com");
    assertThat(created.estado()).isEqualTo("ACTIVO");
    assertThat(created.codigoExterno()).startsWith("EXT-");
  }

  @Test
  void createExternalRejectsDniAlreadyUsedByColegiado() {
    colegiadoService.create(
        new ColegiadoUpsertRequest(
            "Maria",
            "Prueba",
            "Demo",
            "12345678",
            LocalDate.of(1993, 2, 15),
            LocalDate.of(2026, 6, 1),
            "Femenino",
            "",
            "999888777",
            "maria@demo.com",
            "",
            null));

    assertThatThrownBy(
            () ->
                personaExternaService.create(
                    new PersonaExternaUpsertRequest(
                        "cliente externo",
                        "Mario",
                        "Prueba",
                        "Demo",
                        "12345678",
                        LocalDate.of(1994, 1, 10),
                        "Masculino",
                        "988777666",
                        "mario@demo.com",
                        null)))
        .isInstanceOf(DuplicateResourceException.class)
        .hasMessage("Ya existe un colegiado registrado con el DNI indicado.");
  }
}
