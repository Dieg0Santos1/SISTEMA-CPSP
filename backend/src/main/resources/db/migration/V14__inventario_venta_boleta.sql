ALTER TABLE inventario_venta
    ADD COLUMN serie VARCHAR(20);

ALTER TABLE inventario_venta
    ADD COLUMN numero_comprobante BIGINT;

CREATE UNIQUE INDEX uq_inventario_venta_comprobante
    ON inventario_venta (serie, numero_comprobante);
