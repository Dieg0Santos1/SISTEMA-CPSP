INSERT INTO colegiado (codigo, dni, nombres, apellidos, estado, email, telefono)
VALUES
    ('CPL-15428', '44521098', 'Flor de Maria', 'Abad Quispe', 'HABILITADA', 'flor.abad@colegiados.pe', '+51 999 412 008'),
    ('CPL-11872', '42110445', 'Javier Raul', 'Paredes Soto', 'OBSERVADA', 'javier.paredes@colegiados.pe', '+51 998 218 302'),
    ('CPL-16304', '47668032', 'Lucia', 'Cardenas Montes', 'HABILITADA', 'lucia.cardenas@colegiados.pe', '+51 987 144 621');

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
VALUES
    ('APO-MEN', 'Aportacion mensual', 'APORTACIONES', 'Cuota ordinaria mensual del colegiado.', 40.00, TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE, 'ACTIVO'),
    ('HAB-PRO', 'Habilitacion profesional', 'HABILITACION', 'Concepto asociado a la vigencia profesional institucional.', 10.00, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, 'ACTIVO'),
    ('CER-JUR', 'Ceremonia de juramentacion', 'CEREMONIAS', 'Pago por ceremonia, kit y coordinacion institucional.', 180.00, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, 'ACTIVO'),
    ('FED-DOC', 'Fedateo de documentos', 'SERVICIOS', 'Validacion de copias y documentos presentados.', 12.00, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE, 'ACTIVO'),
    ('CON-HAB', 'Constancia de habilitacion', 'CERTIFICACIONES', 'Emision de constancia para uso laboral o academico.', 25.00, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, 'ACTIVO'),
    ('ESP-002', 'Registro de segunda especialidad', 'ESPECIALIDADES', 'Registro administrativo de segunda especialidad colegial.', 320.00, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, TRUE, 'INACTIVO');

INSERT INTO comprobante_serie (tipo, serie, correlativo_actual, activa)
VALUES
    ('BOLETA_ELECTRONICA', 'B001', 29894, TRUE),
    ('RECIBO_INTERNO', 'R001', 1842, TRUE),
    ('CONSTANCIA_PAGO', 'C001', 944, TRUE);
