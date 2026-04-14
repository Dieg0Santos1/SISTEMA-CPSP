ALTER TABLE colegiado
    ADD COLUMN ruc VARCHAR(20);

ALTER TABLE colegiado
    ADD COLUMN foto_url TEXT;

UPDATE colegiado
SET estado = 'HABILITADO'
WHERE UPPER(estado) IN ('HABILITADO', 'HABILITADA', 'ACTIVO', 'ACTIVA');

UPDATE colegiado
SET estado = 'NO_HABILITADO'
WHERE UPPER(estado) NOT IN ('HABILITADO');

INSERT INTO cobro (
    colegiado_id,
    tipo_comprobante,
    serie,
    numero_comprobante,
    origen,
    metodo_pago,
    fecha_emision,
    subtotal,
    descuento_total,
    mora_total,
    total,
    observacion,
    estado
)
VALUES
    (
        (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-15428'),
        'RECIBO_INTERNO',
        'R001',
        1843,
        'CAJA',
        'EFECTIVO',
        DATE '2026-03-05',
        40.00,
        0.00,
        0.00,
        40.00,
        'Cuota mensual de marzo',
        'PAGADO'
    ),
    (
        (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304'),
        'RECIBO_INTERNO',
        'R001',
        1844,
        'CAJA',
        'TARJETA',
        DATE '2026-02-11',
        40.00,
        0.00,
        0.00,
        40.00,
        'Cuota mensual de febrero',
        'PAGADO'
    );

INSERT INTO cobro_detalle (
    cobro_id,
    concepto_cobro_id,
    periodo_referencia,
    cantidad,
    monto_unitario,
    descuento,
    mora,
    total_linea
)
VALUES
    (
        (SELECT id FROM cobro WHERE serie = 'R001' AND numero_comprobante = 1843),
        (SELECT id FROM concepto_cobro WHERE codigo = 'APO-MEN'),
        '2026-03',
        1,
        40.00,
        0.00,
        0.00,
        40.00
    ),
    (
        (SELECT id FROM cobro WHERE serie = 'R001' AND numero_comprobante = 1844),
        (SELECT id FROM concepto_cobro WHERE codigo = 'APO-MEN'),
        '2026-02',
        1,
        40.00,
        0.00,
        0.00,
        40.00
    );
