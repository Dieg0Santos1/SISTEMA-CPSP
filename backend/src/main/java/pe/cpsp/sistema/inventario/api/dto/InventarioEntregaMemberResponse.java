package pe.cpsp.sistema.inventario.api.dto;

public record InventarioEntregaMemberResponse(
    Long colegiadoId,
    String codigoColegiatura,
    String nombreCompleto,
    String especialidadPrincipal,
    String estado,
    boolean habilitado,
    boolean entregado) {}
