ALTER TABLE cobro
    ADD COLUMN impreso BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE cobro
    MODIFY COLUMN origen VARCHAR(40) NOT NULL DEFAULT 'CAJA';

UPDATE concepto_cobro
SET afecta_habilitacion = FALSE
WHERE codigo = 'HAB-PRO';

UPDATE concepto_cobro
SET afecta_habilitacion = TRUE
WHERE codigo = 'CER-JUR';

UPDATE comprobante_serie
SET tipo = 'BOLETA'
WHERE serie = 'B001';

DELETE FROM comprobante_serie
WHERE serie IN ('R001', 'C001');

INSERT INTO comprobante_serie (tipo, serie, correlativo_actual, activa)
VALUES ('FACTURA', 'F001', 1000, TRUE);

UPDATE cobro
SET tipo_comprobante = 'BOLETA',
    serie = 'B001',
    estado = 'EMITIDO',
    impreso = TRUE
WHERE tipo_comprobante IN ('RECIBO_INTERNO', 'BOLETA_ELECTRONICA', 'CONSTANCIA_PAGO');

UPDATE colegiado
SET ruc = '20123456789'
WHERE codigo_colegiatura = 'CPL-15428'
  AND (ruc IS NULL OR ruc = '');

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
    estado,
    impreso
)
VALUES
    (
        (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-15428'),
        'BOLETA',
        'B001',
        29895,
        'CAJA',
        'EFECTIVO',
        DATE '2026-01-13',
        180.00,
        0.00,
        0.00,
        180.00,
        'Pago de ceremonia de colegiatura',
        'EMITIDO',
        TRUE
    ),
    (
        (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304'),
        'BOLETA',
        'B001',
        29896,
        'CAJA',
        'TRANSFERENCIA',
        DATE '2026-01-11',
        180.00,
        0.00,
        0.00,
        180.00,
        'Pago de ceremonia de colegiatura',
        'EMITIDO',
        TRUE
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
        (SELECT id FROM cobro WHERE serie = 'B001' AND numero_comprobante = 29895),
        (SELECT id FROM concepto_cobro WHERE codigo = 'CER-JUR'),
        NULL,
        1,
        180.00,
        0.00,
        0.00,
        180.00
    ),
    (
        (SELECT id FROM cobro WHERE serie = 'B001' AND numero_comprobante = 29896),
        (SELECT id FROM concepto_cobro WHERE codigo = 'CER-JUR'),
        NULL,
        1,
        180.00,
        0.00,
        0.00,
        180.00
    );

UPDATE comprobante_serie
SET correlativo_actual = 29896
WHERE serie = 'B001';
