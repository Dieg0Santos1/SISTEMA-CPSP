CREATE TABLE colegiado_especialidad (
    colegiado_id BIGINT NOT NULL,
    orden INT NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    PRIMARY KEY (colegiado_id, orden),
    CONSTRAINT fk_colegiado_especialidad_colegiado
        FOREIGN KEY (colegiado_id) REFERENCES colegiado (id)
);

INSERT INTO colegiado_especialidad (colegiado_id, orden, nombre)
VALUES
    ((SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-15428'), 0, 'Clinica y Salud Mental'),
    ((SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-15428'), 1, 'Psicoterapia Cognitiva'),
    ((SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-11872'), 0, 'Psicologia Forense'),
    ((SELECT id FROM colegiado WHERE codigo_colegiatura = 'CPL-16304'), 0, 'Neuropsicologia');
