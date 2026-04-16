CREATE TABLE evento (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(160) NOT NULL,
    descripcion VARCHAR(600),
    fecha_hora TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evento_asistencia (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evento_id BIGINT NOT NULL,
    colegiado_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_evento_asistencia UNIQUE (evento_id, colegiado_id),
    CONSTRAINT fk_evento_asistencia_evento
        FOREIGN KEY (evento_id) REFERENCES evento (id),
    CONSTRAINT fk_evento_asistencia_colegiado
        FOREIGN KEY (colegiado_id) REFERENCES colegiado (id)
);

CREATE TABLE inventario_producto (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(40) NOT NULL UNIQUE,
    nombre VARCHAR(160) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    descripcion VARCHAR(600),
    precio_referencia DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventario_entrega (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id BIGINT NOT NULL,
    colegiado_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_inventario_entrega UNIQUE (producto_id, colegiado_id),
    CONSTRAINT fk_inventario_entrega_producto
        FOREIGN KEY (producto_id) REFERENCES inventario_producto (id),
    CONSTRAINT fk_inventario_entrega_colegiado
        FOREIGN KEY (colegiado_id) REFERENCES colegiado (id)
);

CREATE TABLE inventario_movimiento (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    producto_id BIGINT NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    detalle VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL,
    fecha_movimiento TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventario_movimiento_producto
        FOREIGN KEY (producto_id) REFERENCES inventario_producto (id)
);

INSERT INTO evento (nombre, descripcion, fecha_hora)
VALUES
    (
        'Jornada de actualizacion clinica',
        'Sesion orientada a protocolos de atencion, casos complejos y estandares de intervencion para colegiados habilitados.',
        TIMESTAMP '2026-04-18 19:00:00'
    ),
    (
        'Encuentro de liderazgo institucional',
        'Espacio de trabajo para coordinadores, comisiones y representantes regionales con foco en gestion colegial.',
        TIMESTAMP '2026-04-27 18:30:00'
    ),
    (
        'Taller de etica y ejercicio profesional',
        'Actividad formativa para revisar criterios eticos, documentacion sensible y toma de decisiones en practica profesional.',
        TIMESTAMP '2026-05-06 17:00:00'
    ),
    (
        'Ceremonia de bienvenida a nuevos colegiados',
        'Acto institucional de integracion con entrega de materiales, presentacion de servicios y recorrido de modulos.',
        TIMESTAMP '2026-05-14 11:00:00'
    );

INSERT INTO evento_asistencia (evento_id, colegiado_id)
VALUES
    ((SELECT id FROM evento WHERE nombre = 'Jornada de actualizacion clinica'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-15428')),
    ((SELECT id FROM evento WHERE nombre = 'Jornada de actualizacion clinica'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304')),
    ((SELECT id FROM evento WHERE nombre = 'Encuentro de liderazgo institucional'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-11872')),
    ((SELECT id FROM evento WHERE nombre = 'Ceremonia de bienvenida a nuevos colegiados'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304'));

INSERT INTO inventario_producto (codigo, nombre, categoria, descripcion, precio_referencia, stock_actual, activo)
VALUES
    (
        'ALM-2026',
        'Almanaques institucionales 2026',
        'Material institucional',
        'Almanaque anual para entrega a colegiados con fechas clave, servicios y canales institucionales.',
        12.00,
        180,
        TRUE
    ),
    (
        'LIB-2026',
        'Libretas institucionales',
        'Material de bienvenida',
        'Libreta de uso profesional para jornadas, ceremonias y atencion en eventos institucionales.',
        18.00,
        125,
        TRUE
    );

INSERT INTO inventario_entrega (producto_id, colegiado_id)
VALUES
    ((SELECT id FROM inventario_producto WHERE codigo = 'ALM-2026'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-15428')),
    ((SELECT id FROM inventario_producto WHERE codigo = 'ALM-2026'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304')),
    ((SELECT id FROM inventario_producto WHERE codigo = 'LIB-2026'), (SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304'));

INSERT INTO inventario_movimiento (producto_id, tipo, detalle, cantidad, fecha_movimiento)
VALUES
    (
        (SELECT id FROM inventario_producto WHERE codigo = 'ALM-2026'),
        'INGRESO',
        'Reposicion para campana de abril',
        80,
        TIMESTAMP '2026-04-12 09:30:00'
    ),
    (
        (SELECT id FROM inventario_producto WHERE codigo = 'LIB-2026'),
        'ENTREGA',
        'Entrega en mesa de bienvenida',
        -1,
        TIMESTAMP '2026-04-13 10:00:00'
    ),
    (
        (SELECT id FROM inventario_producto WHERE codigo = 'ALM-2026'),
        'VENTA',
        'Venta directa en caja',
        -6,
        TIMESTAMP '2026-04-13 16:15:00'
    ),
    (
        (SELECT id FROM inventario_producto WHERE codigo = 'LIB-2026'),
        'INGRESO',
        'Lote inicial para nuevas entregas',
        50,
        TIMESTAMP '2026-04-10 08:45:00'
    );
