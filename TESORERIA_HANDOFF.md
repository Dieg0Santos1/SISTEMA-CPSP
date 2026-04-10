# Handoff de Tesoreria - Sistema CPSP

## Objetivo de este archivo

Este archivo resume:

- lo que ya se hizo en el frontend
- el estado actual del modulo de tesoreria
- los problemas detectados
- lo que se debe mejorar o refactorizar
- la propuesta de reorganizacion profesional
- los 3 pasos recomendados para continuar en otro chat de Codex

La idea es usar este documento como contexto de continuidad.

---

## 1. Contexto general del proyecto

- Proyecto: `SISTEMA-CPSP`
- Institucion: Colegio de Psicologos de Lima
- Frontend: `React + Vite + Tailwind + React Router`
- Backend previsto: `Spring Boot + Java`
- Base de datos: `MySQL`
- Rama base de trabajo: `dev`

---

## 2. Lo que ya se hizo en frontend

### Base compartida

Se dejo una base frontend mas profesional y estable:

- layout administrativo general
- sidebar funcional
- header refinado
- scroll corregido para que el sidebar no se mueva con el contenido
- saludo superior preparado para futuro backend usando contexto de sesion
- navegacion modular con `React Router`
- estructura de mocks mas separada por modulo

### Mejoras tecnicas ya aplicadas

- `lint` limpio
- `build` correcto
- se eliminaron restos del starter de Vite
- se separo la data mock por carpetas de modulo
- se mejoro el layout para desktop y mobile

### Modulos ya trabajados

- `Dashboard`
- `Colegiados`
- `Tribunal`
- antes existia `Pagos`, pero fue evolucionado hacia una vision mas amplia

---

## 3. Estado actual de tesoreria

Se comenzo a transformar el antiguo modulo de `Pagos` en una estructura mas realista:

### Nuevo enfoque creado

- `Caja y Cobros`
- `Conceptos de Cobro`

### Idea funcional aplicada

Ya no pensar solo en:

- pago de mensualidades

Sino en:

- operaciones de cobro con multiples conceptos

Ejemplos de conceptos contemplados:

- aportacion mensual
- habilitacion profesional
- ceremonia de juramentacion
- fedateo
- constancia de habilitacion
- segunda especialidad

### Cambio conceptual importante

El sistema ya no debe modelarse como:

- "pantalla para pagar meses"

Sino como:

- "modulo de caja / cobranza / comprobantes"

---

## 4. Problema detectado en la version actual

Despues de revisar lo construido, se detecto que la pagina de `Caja y Cobros` quedo:

- demasiado cargada
- con muchos bloques visibles al mismo tiempo
- con demasiada informacion junta
- visualmente pesada
- poco practica para el usuario final

### Motivo del problema

La pantalla actual intenta resolver demasiadas cosas a la vez:

- ficha del colegiado
- armado del cobro
- seleccion de conceptos
- detalle del comprobante
- resumen financiero
- historial
- pendientes
- estado de cuenta

Eso puede sentirse moderno visualmente, pero operativamente se vuelve tedioso.

---

## 5. Decision recomendada

La solucion propuesta es:

### Mantener el modulo principal

- `Caja y Cobros`

### Dividirlo en submodulos o subrutas internas

Propuesta:

- `Resumen`
- `Registrar Cobro`
- `Pendientes`
- `Historial`
- `Comprobantes`

### Mantener aparte

- `Conceptos de Cobro`

Este ultimo no deberia mezclarse dentro de la pantalla principal de cobro.
Debe mantenerse como un modulo independiente de administracion/configuracion de tesoreria.

---

## 6. Propuesta profesional de arquitectura UX/UI

### Modulo: Caja y Cobros

#### 1. Resumen

Debe mostrar:

- indicadores de caja
- cobros del dia
- pendientes importantes
- alertas operativas
- accesos rapidos

No debe ser la pantalla para registrar operaciones.

#### 2. Registrar Cobro

Debe ser una experiencia enfocada solo en registrar una operacion.

Elementos recomendados:

- seleccion o busqueda de colegiado
- datos minimos del colegiado
- seleccion de conceptos
- detalle del cobro
- totales
- metodo de pago
- emision de comprobante

Idealmente en pasos:

- Paso 1: seleccionar colegiado
- Paso 2: agregar conceptos
- Paso 3: confirmar y emitir

#### 3. Pendientes

Debe mostrar:

- deudas o cargos pendientes
- filtros por colegiado
- filtros por concepto
- filtros por fecha
- estado del cobro
- acciones rapidas para cobrar

#### 4. Historial

Debe mostrar:

- operaciones ya registradas
- busqueda por colegiado
- filtro por fechas
- filtro por comprobante
- detalle de operacion
- reimpresion o consulta

#### 5. Comprobantes

Debe mostrar:

- boletas emitidas
- series
- numeracion
- tipo de comprobante
- estado de emision
- descarga / impresion

### Modulo: Conceptos de Cobro

Debe servir para administrar el catalogo de conceptos usados por tesoreria.

Campos o reglas sugeridas por concepto:

- nombre
- codigo
- categoria
- descripcion
- monto base
- si usa periodo
- si permite cantidad
- si admite descuento
- si admite mora
- si afecta habilitacion
- si esta exonerado de IGV
- si requiere adjunto
- estado activo/inactivo

---

## 7. Lo que se debe mejorar o refactorizar

### Refactor funcional

- dividir `Caja y Cobros` en submodulos
- separar la pantalla de registro del resto del contexto operativo
- no mezclar historial completo y constructor de cobro en la misma vista principal

### Refactor de UX/UI

- reducir densidad visual
- disminuir cantidad de cards y contenedores simultaneos
- mejorar jerarquia de informacion
- mostrar solo lo necesario segun la tarea actual
- usar flujo por pasos o tabs internas

### Refactor de arquitectura

- pasar de una sola pagina gigante a subrutas dentro del modulo
- mantener `Conceptos de Cobro` como modulo separado
- dejar la estructura lista para consumir backend y reglas reales luego

---

## 8. Los 3 pasos recomendados para arreglarlo

### Paso 1 - Redefinir la arquitectura del modulo

Crear la estructura formal de tesoreria:

- `Caja y Cobros`
  - `Resumen`
  - `Registrar Cobro`
  - `Pendientes`
  - `Historial`
  - `Comprobantes`
- `Conceptos de Cobro`

Objetivo:

- ordenar el trabajo
- bajar complejidad por pantalla
- dejar clara la responsabilidad de cada vista

### Paso 2 - Rediseñar la UX del flujo de cobro

Tomar `Registrar Cobro` y convertirlo en una experiencia enfocada.

Recomendacion:

- no usar una pantalla recargada
- usar pasos o secciones progresivas
- mostrar solo la informacion necesaria para cerrar una operacion

Objetivo:

- que el usuario registre rapido
- que la pantalla no abrume
- que el flujo sea practico para caja/tesoreria

### Paso 3 - Reubicar lo contextual en submodulos correctos

Mover fuera de la pantalla principal de cobro:

- historial completo
- pendientes completos
- estado de cuenta extendido
- administracion de conceptos

Objetivo:

- dejar `Registrar Cobro` limpia
- mejorar claridad operativa
- facilitar crecimiento del modulo

---

## 9. Recomendacion para el siguiente chat de Codex

En el nuevo chat, pedir algo como:

"Quiero refactorizar el modulo de tesoreria siguiendo el archivo `TESORERIA_HANDOFF.md`. Ayudame a convertir `Caja y Cobros` en un modulo principal con submodulos `Resumen`, `Registrar Cobro`, `Pendientes`, `Historial`, `Comprobantes`, y mantener `Conceptos de Cobro` como modulo separado. Quiero hacerlo con enfoque profesional, buen UX/UI y sin sobrecargar la pantalla principal."

---

## 10. Prioridad sugerida de implementacion

Orden recomendado:

1. definir rutas y estructura del modulo
2. crear `Resumen` y `Registrar Cobro`
3. mover `Pendientes` e `Historial` a vistas separadas
4. dejar `Comprobantes`
5. estabilizar `Conceptos de Cobro`
6. despues conectar reglas reales desde backend

---

## 11. Nota final

La direccion correcta ya no es una sola pantalla grande de cobros.

La direccion correcta es:

- un ecosistema de tesoreria
- con tareas separadas
- con mejor usabilidad
- y con una base lista para backend

