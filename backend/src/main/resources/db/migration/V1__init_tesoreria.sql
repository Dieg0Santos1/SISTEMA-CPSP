CREATE TABLE colegiado (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    dni VARCHAR(12) NOT NULL UNIQUE,
    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    email VARCHAR(120),
    telefono VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE concepto_cobro (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    categoria VARCHAR(40) NOT NULL,
    descripcion VARCHAR(255),
    monto_base DECIMAL(10, 2) NOT NULL,
    usa_periodo BOOLEAN NOT NULL DEFAULT FALSE,
    permite_cantidad BOOLEAN NOT NULL DEFAULT FALSE,
    admite_descuento BOOLEAN NOT NULL DEFAULT FALSE,
    admite_mora BOOLEAN NOT NULL DEFAULT FALSE,
    afecta_habilitacion BOOLEAN NOT NULL DEFAULT FALSE,
    exonerado_igv BOOLEAN NOT NULL DEFAULT FALSE,
    requiere_adjunto BOOLEAN NOT NULL DEFAULT FALSE,
    estado VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comprobante_serie (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(40) NOT NULL,
    serie VARCHAR(20) NOT NULL UNIQUE,
    correlativo_actual BIGINT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cobro (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    colegiado_id BIGINT NOT NULL,
    tipo_comprobante VARCHAR(40) NOT NULL,
    serie VARCHAR(20) NOT NULL,
    numero_comprobante BIGINT NOT NULL,
    origen VARCHAR(40) NOT NULL,
    metodo_pago VARCHAR(40) NOT NULL,
    fecha_emision DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    descuento_total DECIMAL(10, 2) NOT NULL,
    mora_total DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    observacion VARCHAR(255),
    estado VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cobro_colegiado
        FOREIGN KEY (colegiado_id) REFERENCES colegiado (id)
);

CREATE TABLE cobro_detalle (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cobro_id BIGINT NOT NULL,
    concepto_cobro_id BIGINT NOT NULL,
    periodo_referencia VARCHAR(80),
    cantidad INT NOT NULL,
    monto_unitario DECIMAL(10, 2) NOT NULL,
    descuento DECIMAL(10, 2) NOT NULL,
    mora DECIMAL(10, 2) NOT NULL,
    total_linea DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cobro_detalle_cobro
        FOREIGN KEY (cobro_id) REFERENCES cobro (id),
    CONSTRAINT fk_cobro_detalle_concepto
        FOREIGN KEY (concepto_cobro_id) REFERENCES concepto_cobro (id)
);
