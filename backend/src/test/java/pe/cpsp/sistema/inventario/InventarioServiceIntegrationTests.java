package pe.cpsp.sistema.inventario;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import pe.cpsp.sistema.colegiados.domain.model.PersonaExterna;
import pe.cpsp.sistema.colegiados.infrastructure.persistence.repository.PersonaExternaRepository;
import pe.cpsp.sistema.common.exception.DuplicateResourceException;
import pe.cpsp.sistema.common.exception.InvalidRequestException;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaItemRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioRegistrarVentaRequest;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentaResponse;
import pe.cpsp.sistema.inventario.api.dto.InventarioVentasPanelResponse;
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
  @Autowired private PersonaExternaRepository personaExternaRepository;

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

  @Test
  void registrarVentaDescuentaStockYLaIncluyeEnPanel() {
    InventarioVentaResponse venta =
        inventarioService.registrarVenta(
            new InventarioRegistrarVentaRequest(
                "COLEGIADO",
                1L,
                "EFECTIVO",
                LocalDate.of(2026, 4, 18),
                "Venta mostrador",
                java.util.List.of(
                    new InventarioRegistrarVentaItemRequest(1L, 2),
                    new InventarioRegistrarVentaItemRequest(2L, 1))));

    InventarioDashboardResponse dashboard = inventarioService.getDashboard();
    InventarioVentasPanelResponse panel = inventarioService.getVentasPanel();

    assertThat(venta.tipoComprobante()).isEqualTo("BOLETA");
    assertThat(venta.serie()).isEqualTo("B001");
    assertThat(venta.numeroComprobante()).isEqualTo(29897L);
    assertThat(venta.referencia()).isEqualTo("B001-0029897");
    assertThat(venta.impreso()).isFalse();
    assertThat(venta.total()).isEqualByComparingTo("42.00");
    assertThat(venta.items()).hasSize(2);
    assertThat(dashboard.productos())
        .anySatisfy(
            producto -> {
              if (producto.id().equals(1L)) {
                assertThat(producto.stockActual()).isEqualTo(178);
              }
            });
    assertThat(panel.ventas()).isNotEmpty();
    assertThat(panel.ventas().get(0).clienteNombre()).contains("Flor");
  }

  @Test
  void registrarVentaPermiteClienteExterno() {
    PersonaExterna externo = new PersonaExterna();
    externo.setCodigoExterno("EXT-00099");
    externo.setTipoExterno("Participante externo");
    externo.setNombre("Ana");
    externo.setApellidoPaterno("Prueba");
    externo.setApellidoMaterno("Lopez");
    externo.setDni("77889900");
    externo.setFechaNacimiento(LocalDate.of(1998, 6, 11));
    externo.setEstado("ACTIVO");
    personaExternaRepository.save(externo);

    InventarioVentaResponse venta =
        inventarioService.registrarVenta(
            new InventarioRegistrarVentaRequest(
                "EXTERNO",
                externo.getId(),
                "TRANSFERENCIA",
                LocalDate.of(2026, 4, 18),
                null,
                java.util.List.of(new InventarioRegistrarVentaItemRequest(2L, 2))));

    assertThat(venta.clienteTipo()).isEqualTo("EXTERNO");
    assertThat(venta.clienteNombre()).contains("Ana");
    assertThat(venta.referencia()).startsWith("B001-");
    assertThat(venta.total()).isEqualByComparingTo("36.00");
  }

  @Test
  void marcarVentaImpresaActualizaBanderaPersistida() {
    InventarioVentaResponse venta =
        inventarioService.registrarVenta(
            new InventarioRegistrarVentaRequest(
                "COLEGIADO",
                1L,
                "EFECTIVO",
                LocalDate.of(2026, 4, 18),
                "Venta para impresion",
                java.util.List.of(new InventarioRegistrarVentaItemRequest(1L, 1))));

    inventarioService.marcarVentaImpresa(venta.id());

    assertThat(inventarioService.getVenta(venta.id()).impreso()).isTrue();
  }

  @Test
  void registrarVentaRechazaCuandoNoHayStockSuficiente() {
    assertThatThrownBy(
            () ->
                inventarioService.registrarVenta(
                    new InventarioRegistrarVentaRequest(
                        "COLEGIADO",
                        1L,
                        "EFECTIVO",
                        LocalDate.of(2026, 4, 18),
                        null,
                        java.util.List.of(new InventarioRegistrarVentaItemRequest(2L, 999)))))
        .isInstanceOf(InvalidRequestException.class)
        .hasMessageContaining("No hay stock suficiente");
  }
}
