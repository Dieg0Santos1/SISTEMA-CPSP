ALTER TABLE colegiado
    ADD COLUMN nombre VARCHAR(120) NOT NULL DEFAULT '';

ALTER TABLE colegiado
    ADD COLUMN apellido_materno VARCHAR(120) NOT NULL DEFAULT '';

ALTER TABLE colegiado
    ADD COLUMN apellido_paterno VARCHAR(120) NOT NULL DEFAULT '';

ALTER TABLE colegiado
    ADD COLUMN codigo_colegiatura VARCHAR(20) NOT NULL DEFAULT '';

ALTER TABLE colegiado
    ADD COLUMN fecha_nacimiento DATE;

ALTER TABLE colegiado
    ADD COLUMN fecha_iniciacion DATE;

ALTER TABLE colegiado
    ADD COLUMN sexo VARCHAR(20);

ALTER TABLE colegiado
    ADD COLUMN direccion VARCHAR(255);

ALTER TABLE colegiado
    ADD COLUMN celular VARCHAR(30);

UPDATE colegiado
SET
    nombre = nombres,
    apellido_paterno = apellidos,
    apellido_materno = '',
    codigo_colegiatura = codigo,
    celular = telefono;

ALTER TABLE colegiado
    ADD CONSTRAINT uk_colegiado_codigo_colegiatura UNIQUE (codigo_colegiatura);

ALTER TABLE colegiado
    DROP COLUMN codigo;

ALTER TABLE colegiado
    DROP COLUMN nombres;

ALTER TABLE colegiado
    DROP COLUMN apellidos;

ALTER TABLE colegiado
    DROP COLUMN telefono;
