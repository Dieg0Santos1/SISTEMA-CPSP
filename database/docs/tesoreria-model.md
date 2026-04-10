# Modelo inicial de tesoreria

## Tablas base

- `colegiado`
- `concepto_cobro`
- `comprobante_serie`
- `cobro`
- `cobro_detalle`

## Criterio

- `concepto_cobro` concentra reglas administrativas y tributarias del catalogo.
- `comprobante_serie` controla series activas y correlativos.
- `cobro` representa la cabecera de una operacion de caja.
- `cobro_detalle` permite multiples conceptos por comprobante.

## Nota

El siguiente paso natural es ampliar el modelo con:

- usuarios y roles
- auditoria
- estados de habilitacion
- anulaciones y reimpresiones
- cuentas por cobrar y periodos
