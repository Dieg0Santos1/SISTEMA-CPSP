ALTER TABLE cobro
    ADD COLUMN area_codigo VARCHAR(10);

ALTER TABLE cobro
    ADD COLUMN area_nombre VARCHAR(80);

ALTER TABLE cobro
    ADD COLUMN generado_por VARCHAR(120);

UPDATE cobro
SET area_codigo = '001',
    area_nombre = 'Tesoreria',
    generado_por = 'Migracion historica'
WHERE area_codigo IS NULL
   OR area_nombre IS NULL
   OR generado_por IS NULL;

ALTER TABLE cobro
    MODIFY COLUMN area_codigo VARCHAR(10) NOT NULL;

ALTER TABLE cobro
    MODIFY COLUMN area_nombre VARCHAR(80) NOT NULL;

ALTER TABLE cobro
    MODIFY COLUMN generado_por VARCHAR(120) NOT NULL;
