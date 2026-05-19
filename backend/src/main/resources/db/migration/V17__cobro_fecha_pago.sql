ALTER TABLE cobro
    ADD COLUMN fecha_pago DATE;

UPDATE cobro
SET fecha_pago = fecha_emision
WHERE fecha_pago IS NULL;

ALTER TABLE cobro
    MODIFY COLUMN fecha_pago DATE NOT NULL;

