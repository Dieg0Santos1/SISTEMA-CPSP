package pe.cpsp.sistema.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.inventario.api.dto.InventarioDashboardResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoCreateRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoDetailResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioProductoListItemResponse;
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
    InventarioDashboardResponse dashboard = inventarioService.getDashboard();

    assertThat(detail.stockActual()).isEqualTo(124);
    assertThat(detail.entregasRegistradas()).isEqualTo(2);
    assertThat(detail.colegiados())
        .anySatisfy(
            member -> {
              assertThat(member.colegiadoId()).isEqualTo(1L);
              assertThat(member.entregado()).isTrue();
            });
    assertThat(dashboard.movimientos().getFirst().detalle()).contains("Flor de Maria Abad Quispe");
  }

  @Test
  void createProductoPersistsItAndUsesInitialStock() {
    InventarioProductoListItemResponse created =
        inventarioService.crearProducto(
            new InventarioProductoCreateRequest(
                "MAT-TEST",
                "Material de prueba",
                "Material institucional",
                "Producto creado desde test",
                new BigDecimal("9.90"),
                12));

    assertThat(created.codigo()).isEqualTo("MAT-TEST");
    assertThat(created.nombre()).isEqualTo("Material de prueba");
    assertThat(created.stockActual()).isEqualTo(12);
  }

  @Test
  void createProductoRejectsDuplicateCode() {
    assertThatThrownBy(
            () ->
                inventarioService.crearProducto(
                    new InventarioProductoCreateRequest(
                        "ALM-2026",
                        "Duplicado",
                        "Material institucional",
                        "Intento duplicado",
                        new BigDecimal("10.00"),
                        1)))
        .isInstanceOf(DuplicateResourceException.class)
        .hasMessage("Ya existe un producto con ese codigo.");
  }
}
