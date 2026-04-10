# Handoff de Colegiados - Sistema CPSP

## Objetivo de este archivo

Este documento deja definido el siguiente bloque de desarrollo del proyecto para que otro integrante del equipo pueda trabajar el modulo de `colegiados` en una rama propia sin perder contexto.

Su proposito es dejar claro:

- el estado actual del proyecto
- lo que ya esta listo en backend
- que falta construir en `colegiados`
- el orden recomendado de implementacion
- los endpoints esperados
- las validaciones minimas
- como se debe integrar despues con frontend y tesoreria

---

## 1. Estado actual del proyecto

- Proyecto: `SISTEMA-CPSP`
- Backend: `Spring Boot 3.5 + Java 21 + Maven`
- Base de datos: `MySQL 8`
- Migraciones: `Flyway`
- Frontend: `React + Vite + Tailwind + React Router`

### Lo que ya esta listo

- backend base funcionando
- Flyway configurado y operativo
- tablas iniciales creadas al arrancar el backend
- modulo inicial de `tesoreria` de lectura
- tabla `colegiado` ya adaptada a la estructura requerida para el siguiente hito

### Estado actual de la tabla `colegiado`

La tabla `colegiado` ya debe existir con estos campos:

- `id`
- `nombre`
- `apellido_materno`
- `apellido_paterno`
- `dni`
- `codigo_colegiatura`
- `estado`
- `fecha_nacimiento`
- `fecha_iniciacion`
- `sexo`
- `direccion`
- `celular`
- `email`
- `created_at`
- `updated_at`

---

## 2. Objetivo del siguiente desarrollo

Construir el backend funcional del modulo de `colegiados` para soportar operaciones reales sobre la tabla ya creada.

El alcance inmediato del modulo debe cubrir:

- crear colegiados
- editar colegiados
- listar colegiados
- consultar colegiado por `id`
- consultar colegiado por `dni`
- consultar colegiado por `codigo_colegiatura`

Este modulo debe quedar listo para que luego el frontend de `colegiados` reemplace mocks por consumo real de API.

---

## 3. Razon de prioridad

Antes de seguir profundizando `tesoreria`, el sistema necesita una base real de colegiados.

Esto es importante porque:

- tesoreria debe registrar cobros asociados a colegiados reales
- el frontend ya tiene modulo visual de colegiados y luego necesitara integracion real
- sin este modulo, los siguientes flujos quedarian apoyados en datos incompletos o simulados

---

## 4. Alcance tecnico esperado en backend

El modulo de `colegiados` debe construirse con una estructura limpia y consistente con el backend actual.

### Piezas esperadas

- entidad JPA `Colegiado`
- repositorio JPA
- DTOs de request y response
- servicio de aplicacion
- controlador REST
- manejo de errores y validaciones
- pruebas del modulo

### Capacidades esperadas

- registrar un colegiado nuevo
- editar un colegiado existente
- listar colegiados con datos utiles para pantalla de tabla
- buscar por `id`, `dni` o `codigo_colegiatura`

---

## 5. Reglas y validaciones minimas

### Unicidad

- `dni` debe ser unico
- `codigo_colegiatura` debe ser unico

### Campos obligatorios

Como minimo deben validarse como obligatorios:

- `nombre`
- `apellido_materno`
- `apellido_paterno`
- `dni`
- `codigo_colegiatura`
- `estado`

### Validaciones sugeridas

- `dni` con longitud valida y solo numeros
- `email` con formato valido si se envia
- `celular` con longitud razonable si se envia
- fechas con formato correcto
- no permitir actualizar un registro inexistente
- devolver respuestas claras cuando haya duplicados por `dni` o `codigo_colegiatura`

### Estados

El campo `estado` debe manejarse de forma consistente.

Sugerencia inicial:

- `ACTIVO`
- `INACTIVO`

Si el proyecto ya viene usando otros valores, validar antes de fijarlos definitivamente.

---

## 6. Endpoints esperados

Estos endpoints representan el objetivo funcional base del modulo.

### Crear colegiado

- `POST /api/v1/colegiados`

### Editar colegiado

- `PUT /api/v1/colegiados/{id}`

### Listar colegiados

- `GET /api/v1/colegiados`

### Consultar por id

- `GET /api/v1/colegiados/{id}`

### Consultar por DNI

- `GET /api/v1/colegiados/dni/{dni}`

### Consultar por codigo de colegiatura

- `GET /api/v1/colegiados/codigo/{codigoColegiatura}`

Opcionalmente, mas adelante se puede agregar busqueda combinada con query params, pero para este hito no es obligatorio.

---

## 7. Orden recomendado de implementacion

### Paso 1

Crear la entidad `Colegiado` alineada con la tabla actual.

### Paso 2

Crear el repositorio con consultas por:

- `id`
- `dni`
- `codigo_colegiatura`

### Paso 3

Crear DTOs para:

- request de creacion
- request de actualizacion
- response de detalle
- response de listado

### Paso 4

Implementar el servicio con la logica principal:

- crear
- editar
- listar
- obtener por identificadores
- validar duplicados

### Paso 5

Crear el controlador REST del modulo.

### Paso 6

Agregar pruebas de servicio y pruebas de integracion para validar:

- creacion exitosa
- rechazo por duplicado de `dni`
- rechazo por duplicado de `codigo_colegiatura`
- edicion correcta
- consulta por `id`
- consulta por `dni`
- consulta por `codigo_colegiatura`

---

## 8. Integracion esperada con frontend

Una vez listo el backend de `colegiados`, el frontend deberia avanzar en este orden:

1. conectar el listado real de colegiados
2. conectar el formulario de registro
3. conectar la edicion
4. conectar la vista detalle
5. reemplazar mocks del modulo

La idea es no tocar todavia `tesoreria` hasta que `colegiados` quede estable.

---

## 9. Relacion con tesoreria

Cuando este modulo quede terminado, el siguiente paso natural sera volver a `tesoreria` para:

- seleccionar colegiados reales al registrar cobros
- relacionar `cobro` con `colegiado` de forma funcional
- construir historial real por colegiado
- soportar pendientes y comprobantes sobre datos persistidos

---

## 10. Flujo de trabajo recomendado en Git

Para colaboracion con otro desarrollador:

1. subir este documento y los cambios actuales a la rama `dev`
2. crear una rama especifica para el trabajo de `colegiados`
3. desarrollar el modulo solo en esa rama
4. abrir PR hacia `dev` al terminar el bloque funcional

Nombre sugerido de rama:

- `feature/backend-colegiados`

Si el frontend de `colegiados` se trabaja aparte, se puede separar despues en otra rama.

---

## 11. Objetivo concreto para el siguiente desarrollador

El objetivo del siguiente bloque de trabajo debe ser:

"Dejar listo el CRUD base del modulo de colegiados en backend, apoyado en la tabla `colegiado` ya creada por Flyway, con endpoints funcionales, validaciones basicas y pruebas suficientes para luego integrar el frontend."

---

## 12. Nota final

El proyecto ya supero la etapa de preparacion inicial.

La base de datos ya existe, las migraciones ya funcionan y el siguiente hito real no es crear mas estructura vacia, sino convertir `colegiados` en un modulo backend usable.

Ese modulo es el puente necesario entre la base de datos ya creada y la futura integracion real con frontend y tesoreria.
