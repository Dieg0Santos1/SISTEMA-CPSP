package pe.cpsp.sistema.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.application.InventarioService;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class InventarioServiceIntegrationTests {

  @Autowired private InventarioService inventarioService;

  @Test
  void registerEntregaRejectsColegiadoNoHabilitado() {
    assertThatThrownBy(() -> inventarioService.registrarEntrega(2L, 2L))
        .isInstanceOf(InvalidRequestException.class)
        .hasMessage("Solo los colegiados habilitados pueden recibir productos del inventario.");
  }

  @Test
  void registerEntregaAllowsColegiadoHabilitadoAndUpdatesStock() {
    InventarioProductoDetailResponse detail = inventarioService.registrarEntrega(2L, 1L);

    assertThat(detail.stockActual()).isEqualTo(124);
    assertThat(detail.entregasRegistradas()).isEqualTo(2);
    assertThat(detail.colegiados())
        .anySatisfy(
            member -> {
              assertThat(member.colegiadoId()).isEqualTo(1L);
              assertThat(member.entregado()).isTrue();
            });
  }
}
