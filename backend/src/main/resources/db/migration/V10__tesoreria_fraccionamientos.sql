CREATE TABLE fraccionamiento (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    colegiado_id BIGINT NOT NULL,
    monto_total DECIMAL(10, 2) NOT NULL,
    numero_cuotas INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    observacion VARCHAR(255),
    estado VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fraccionamiento_colegiado
        FOREIGN KEY (colegiado_id) REFERENCES colegiado (id)
);

CREATE TABLE fraccionamiento_periodo (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fraccionamiento_id BIGINT NOT NULL,
    periodo_referencia VARCHAR(7) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fraccionamiento_periodo_parent
        FOREIGN KEY (fraccionamiento_id) REFERENCES fraccionamiento (id)
);

CREATE TABLE fraccionamiento_cuota (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fraccionamiento_id BIGINT NOT NULL,
    numero_cuota INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    fecha_pago DATE,
    estado VARCHAR(20) NOT NULL,
    cobro_detalle_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fraccionamiento_cuota_parent
        FOREIGN KEY (fraccionamiento_id) REFERENCES fraccionamiento (id),
    CONSTRAINT fk_fraccionamiento_cuota_detalle
        FOREIGN KEY (cobro_detalle_id) REFERENCES cobro_detalle (id)
);

INSERT INTO concepto_cobro (
    codigo,
    nombre,
    categoria,
    descripcion,
    monto_base,
    usa_periodo,
    permite_cantidad,
    admite_descuento,
    admite_mora,
    afecta_habilitacion,
    exonerado_igv,
    requiere_adjunto,
    estado
)
SELECT
    'FRAC-CUO',
    'Cuota de fraccionamiento',
    'SERVICIOS',
    'Concepto interno para registrar cuotas de fraccionamientos.',
    0.00,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    FALSE,
    TRUE,
    FALSE,
    'ACTIVO'
WHERE NOT EXISTS (
    SELECT 1 FROM concepto_cobro WHERE codigo = 'FRAC-CUO'
);
