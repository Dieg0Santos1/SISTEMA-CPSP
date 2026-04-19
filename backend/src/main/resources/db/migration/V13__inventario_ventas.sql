CREATE TABLE inventario_venta (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    referencia VARCHAR(20) NOT NULL UNIQUE,
    cliente_tipo VARCHAR(20) NOT NULL,
    cliente_referencia_id BIGINT NOT NULL,
    cliente_codigo VARCHAR(40) NOT NULL,
    cliente_nombre VARCHAR(220) NOT NULL,
    cliente_documento VARCHAR(20) NOT NULL,
    cliente_detalle VARCHAR(120),
    metodo_pago VARCHAR(30) NOT NULL,
    observacion VARCHAR(255),
    fecha_venta DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventario_venta_detalle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    total_linea DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventario_venta_detalle_venta
        FOREIGN KEY (venta_id) REFERENCES inventario_venta (id),
    CONSTRAINT fk_inventario_venta_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES inventario_producto (id)
);
