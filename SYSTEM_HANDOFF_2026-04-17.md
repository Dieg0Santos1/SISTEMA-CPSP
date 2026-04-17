# SYSTEM HANDOFF 2026-04-17

## Estado general

El proyecto ya tiene una base funcional y consistente en estos modulos:

- `Colegiados`
- `Caja y Cobros`
- `Conceptos de Cobro`
- `Eventos`
- `Inventario`

La base vigente sigue siendo:

- `backend`: Spring Boot + JPA + Flyway + MySQL
- `frontend`: React + Vite

## Lo ya resuelto

### Colegiados

- Tabla `colegiado` ya alineada con los campos reales del negocio.
- CRUD base funcional.
- Registro y edicion desde frontend.
- Validaciones y normalizacion de datos:
  - nombres/apellidos capitalizados
  - `dni` de 8 digitos
  - celular con prefijo `+51`
- Estado inicial del colegiado:
  - siempre entra como `NO_HABILITADO`

### Caja y Cobros

- El modulo ya trabaja con backend y BD reales.
- Las paginas conectadas son:
  - `Resumen`
  - `Registrar cobro`
  - `Historial`
  - `Comprobantes`
- Ya no dependen de mocks para datos operativos principales.
- El flujo de `Registrar cobro` soporta:
  - seleccion real de colegiado
  - conceptos reales
  - multiples items en una sola boleta/factura
  - impresion / no impreso
  - series oficiales:
    - `B001` para boleta
    - `F001` para factura
- Metodos de pago actuales:
  - `EFECTIVO`
  - `YAPE_PLIN`
  - `TRANSFERENCIA`
  - `POS_TARJETA`

### Logica de tesoreria

- `ceremonia de colegiatura` es el primer pago obligatorio.
- Mientras no se paga ceremonia:
  - no nacen aportaciones mensuales.
- Cuando se paga ceremonia:
  - el colegiado queda cubierto por 3 meses desde la fecha real de pago.
  - el primer periodo exigible pasa a ser el mes siguiente.
- Cada pago de aportacion mensual:
  - vuelve a dar 3 meses de cobertura desde la fecha real de pago.
- Colores de periodos:
  - verde: pagado
  - naranja: dentro de la ventana de 3 meses desde el ultimo periodo pagado
  - rojo: deuda vencida
  - morado: refinanciado

### Fraccionamiento

Ya esta integrada la primera version funcional.

- Se crea desde `Registrar cobro`, debajo de la card de `Estado proyectado`.
- Solo aplica cuando:
  - no hay ceremonia pendiente
  - hay deuda historica refinanciable
  - no existe ya un fraccionamiento activo
- El encargado elige:
  - numero de cuotas
  - fecha de inicio
  - observacion
- El sistema:
  - genera cuotas mensuales consecutivas
  - bloquea esos periodos para que no vuelvan a cobrarse como deuda normal
  - los marca como `REFINANCED`
- Luego, en un cobro normal, se puede pagar:
  - cuota de fraccionamiento
  - aportacion mensual
  - otros conceptos
  - todo en una sola boleta/factura

Regla importante:

- pagar una cuota de fraccionamiento no habilita por si solo
- la habilitacion sigue dependiendo de la aportacion mensual vigente

### Conceptos de Cobro

- Ya conectados a backend y BD.
- CRUD funcional:
  - crear
  - editar
  - eliminar
- Si un concepto ya fue usado en cobros:
  - no se elimina fisicamente
  - se marca `INACTIVO`
- UI ya incluye:
  - buscador
  - filtro por categoria
  - paginacion de 4 en 4
  - acciones de editar / eliminar

### Eventos

- Vista base funcional.
- Ajustes UI ya hechos:
  - lista de eventos mas compacta
  - sin chips innecesarios
  - buscador por codigo o nombre en el cuadro de asistentes
- Sigue pendiente profundizar funcionalidad si se quiere llevar mas lejos el modulo.

### Inventario

- Conectado a backend y BD.
- Ya se puede:
  - listar productos reales
  - agregar productos
  - registrar stock inicial
  - registrar entrega de producto
- El historial de movimientos ya muestra mejor detalle:
  - si es ingreso, muestra descripcion
  - si es entrega, muestra a quien se entrego
- UI ya tiene:
  - buscador
  - paginacion
  - modal de entrega con buscador por codigo o nombre

## Archivos y piezas importantes

### Backend tesoreria

- `backend/src/main/java/pe/cpsp/sistema/tesoreria/application/TesoreriaSupport.java`
- `backend/src/main/java/pe/cpsp/sistema/tesoreria/application/TesoreriaQueryService.java`
- `backend/src/main/java/pe/cpsp/sistema/tesoreria/application/TesoreriaCobroService.java`
- `backend/src/main/java/pe/cpsp/sistema/tesoreria/application/TesoreriaFraccionamientoService.java`
- `backend/src/main/java/pe/cpsp/sistema/tesoreria/api/TesoreriaFraccionamientoController.java`
- `backend/src/main/resources/db/migration/V10__tesoreria_fraccionamientos.sql`

### Frontend tesoreria

- `frontend/src/pages/cobros/CobrosResumenPage.jsx`
- `frontend/src/pages/cobros/CobrosRegistrarPage.jsx`
- `frontend/src/pages/cobros/CobrosHistorialPage.jsx`
- `frontend/src/pages/cobros/CobrosComprobantesPage.jsx`
- `frontend/src/pages/ConceptosPage.jsx`
- `frontend/src/services/tesoreriaApi.js`

### Eventos e inventario

- `frontend/src/pages/EventosPage.jsx`
- `frontend/src/pages/eventos/EventosOverviewPage.jsx`
- `frontend/src/pages/InventarioPage.jsx`
- `backend/src/main/java/pe/cpsp/sistema/inventario/application/InventarioService.java`

## Reglas de negocio ya asumidas

- `FACTURA` requiere `RUC`.
- `Emitido` significa que el cobro ya fue registrado y obtuvo serie/correlativo.
- `Impreso` se marca cuando el usuario pulsa el boton de imprimir.
- La deuda automatica historica se basa en:
  - ceremonia pendiente
  - aportaciones mensuales pendientes
- Servicios sueltos como fedateo o constancias no generan deuda automatica historica.

## Casos de prueba utiles

Caso de fraccionamiento:

- colegiado con ceremonia ya pagada
- ultimo periodo pagado antiguo
- deuda historica grande
- crear fraccionamiento
- pagar una cuota + aportacion mensual en la misma boleta

Caso importante ya validado:

- si el ultimo periodo pagado es `2026-06`
- entonces `2026-07`, `2026-08` y `2026-09` deben verse en naranja

## Validaciones recientes

Ultima validacion antes de este handoff:

- `./mvnw.cmd test` OK
- `npm run build` OK
- `npm run lint` OK con 1 warning viejo en `ColegiadosPage.jsx`

Warning conocido:

- `frontend/src/pages/ColegiadosPage.jsx`
  - dependencia faltante en `useEffect` para `closeCreateModal`
  - no bloquea build ni funcionamiento actual

## Pendientes razonables para la siguiente iteracion

- mejorar mas el flujo de impresion real de comprobantes
- permitir administrar mas series y metodos de pago desde UI
- profundizar modulo de eventos
- profundizar modulo de inventario con ventas y mas trazabilidad
- agregar mas reportes y exportaciones reales

## Nota operativa

Este archivo se creo para retomar en otro chat de Codex sin perder contexto. Si se continua el trabajo, lo recomendable es abrir primero:

- `BACKEND_HANDOFF.md`
- `TESORERIA_HANDOFF.md`
- este archivo: `SYSTEM_HANDOFF_2026-04-17.md`

