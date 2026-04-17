package pe.cpsp.sistema.tesoreria.api;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import pe.cpsp.sistema.tesoreria.api.dto.CrearFraccionamientoRequest;
import pe.cpsp.sistema.tesoreria.api.dto.FraccionamientoDetailResponse;
import pe.cpsp.sistema.tesoreria.application.TesoreriaFraccionamientoService;

@RestController
@RequestMapping("/api/v1/tesoreria/colegiados/{colegiadoId}/fraccionamiento")
public class TesoreriaFraccionamientoController {

  private final TesoreriaFraccionamientoService tesoreriaFraccionamientoService;

  public TesoreriaFraccionamientoController(
      TesoreriaFraccionamientoService tesoreriaFraccionamientoService) {
    this.tesoreriaFraccionamientoService = tesoreriaFraccionamientoService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public FraccionamientoDetailResponse crear(
      @PathVariable Long colegiadoId, @Valid @RequestBody CrearFraccionamientoRequest request) {
    return tesoreriaFraccionamientoService.crear(colegiadoId, request);
  }
}
