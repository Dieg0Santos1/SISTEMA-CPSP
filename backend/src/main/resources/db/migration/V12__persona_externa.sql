CREATE TABLE persona_externa (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    codigo_externo VARCHAR(20) NOT NULL,
    tipo_externo VARCHAR(40) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    apellido_paterno VARCHAR(120) NOT NULL,
    apellido_materno VARCHAR(120) NOT NULL,
    dni VARCHAR(12) NOT NULL,
    fecha_nacimiento DATE,
    sexo VARCHAR(20),
    celular VARCHAR(30),
    email VARCHAR(120),
    foto_url LONGTEXT,
    estado VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE persona_externa
    ADD CONSTRAINT uk_persona_externa_codigo UNIQUE (codigo_externo);

ALTER TABLE persona_externa
    ADD CONSTRAINT uk_persona_externa_dni UNIQUE (dni);
