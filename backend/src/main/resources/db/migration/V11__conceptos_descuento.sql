alter table concepto_cobro
    add column tipo_concepto varchar(20) not null default 'NORMAL';

alter table concepto_cobro
    add column tipo_descuento varchar(20);

alter table concepto_cobro
    add column valor_descuento decimal(10, 2);

alter table concepto_cobro
    add column aplica_descuento_a varchar(40);
