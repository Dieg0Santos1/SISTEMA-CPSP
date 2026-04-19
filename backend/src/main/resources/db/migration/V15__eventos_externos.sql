ALTER TABLE evento_asistencia
    MODIFY COLUMN colegiado_id BIGINT NULL;

ALTER TABLE evento_asistencia
    ADD COLUMN persona_externa_id BIGINT NULL;

ALTER TABLE evento_asistencia
    ADD CONSTRAINT fk_evento_asistencia_persona_externa
        FOREIGN KEY (persona_externa_id) REFERENCES persona_externa (id);

CREATE UNIQUE INDEX uq_evento_asistencia_externo
    ON evento_asistencia (evento_id, persona_externa_id);
