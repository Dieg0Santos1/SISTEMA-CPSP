package pe.cpsp.sistema.inventario.api.dto;

public record InventarioClienteVentaResponse(
    Long id,
    String tipoRegistro,
    String codigo,
    String nombreCompleto,
    String documento,
    String detalle) {}
