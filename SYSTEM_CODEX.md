## 🧠 Descripción General del Sistema

El sistema tiene como objetivo digitalizar y optimizar la gestión administrativa del Colegio de Psicólogos de Lima.

Permitirá gestionar:

- colegiados
- pagos y aportaciones
- habilitación profesional
- reportes administrativos
- consulta pública
- procesos internos (eventos, inventario, elecciones, tribunal de honor)

El sistema será utilizado por personal administrativo y también contará con una consulta pública.

---

## 🎯 Objetivos del Sistema

- Automatizar procesos manuales
- Reducir errores humanos
- Centralizar la información
- Facilitar consultas rápidas
- Mejorar control administrativo
- Tener trazabilidad (auditoría)

---

## 👥 Usuarios del Sistema

- Administrador
- Secretaría
- Tesorería
- Administración
- Público (consulta externa)

---

# 📦 MÓDULOS DEL SISTEMA

---

## 🧩 Módulo 1 – Gestión de Colegiados

### Funcionalidades

- Registrar colegiados
- Editar colegiados
- Buscar por:
  - DNI
  - Nombre
  - Número de colegiatura
- Generar número correlativo automáticamente
- Registrar fotografía
- Registrar datos personales completos
- Manejar múltiples especialidades
- Estado:
  - Activo
  - Inactivo

### Automatizaciones

- Validación de DNI duplicado
- Validación de campos obligatorios
- Generación automática del número de colegiatura

---

## 💰 Módulo 2 – Pagos y Boletas

### Funcionalidades

- Registrar pagos de colegiatura
- Control de aportaciones mensuales
- Historial de pagos
- Métodos de pago:
  - efectivo
  - transferencia
  - otros
- Generación de boletas
- Venta de papel de constancia (numerado)

### Automatizaciones

- Cálculo automático de habilitación
- Cada pago habilita 3 meses
- Validación de pagos duplicados
- Generación automática de número de boleta
- Control automático de numeración de documentos

### Reglas especiales

- Habilitación mensual: S/10
- Exonerado de IGV

---

## 📊 Módulo 3 – Reportes y Consulta Pública

### Funcionalidades

- Reporte de colegiados
- Reporte por rango de fechas
- Reporte de ingresos
- Consulta pública de colegiados
- Búsqueda pública
- Estado de habilitación
- Generación de certificado PDF

### Automatizaciones

- Generación automática de PDF
- Cálculo automático de estado (habilitado / no)

---

## 🎉 Módulo 4 – Eventos

### Funcionalidades

- Registro de asistentes
- Listado de asistentes
- Registro de eventos

### Automatizaciones

- Validación de colegiado existente
- Control de participación

---

## 🎁 Módulo 5 – Control de Presentes

### Funcionalidades

- Registro de presentes entregados
- Asociación a colegiado
- Historial de entregas

---

## 📦 Módulo 6 – Inventario y Ventas

### Funcionalidades

- Registro de materiales
- Control de stock
- Venta de materiales
- Historial de movimientos

### Automatizaciones

- Actualización automática de stock
- Validación de stock disponible

---

## 🗳️ Módulo 7 – Elecciones

### Funcionalidades

- Validación de colegiados habilitados
- Registro de elecciones
- Generación de mesas electorales

### Automatizaciones

- Solo votan habilitados
- Generación aleatoria de mesas

---

## ⚖️ Módulo 8 – Tribunal de Honor

### Funcionalidades

- Registro de denuncias
- Evaluación de casos
- Seguimiento
- Registro de sentencia

### Automatizaciones

- Flujo de estado del caso:
  - registrado
  - en evaluación
  - resuelto

---

## 🎓 Módulo 9 – Especialidades

### Funcionalidades

- Registro de especialidades
- Segunda especialidad
- Tercera especialidad
- Relación colegiado-especialidad

---

# ⚙️ REGLAS DE NEGOCIO

- Número de colegiatura es correlativo
- Pago habilita 3 meses
- Solo colegiados habilitados pueden votar
- Todo cambio debe registrarse (auditoría)
- Boletas obligatorias
- Control de numeración en documentos
- Control por roles

---

# 🔐 SEGURIDAD

- Login con usuario y contraseña
- Roles y permisos
- Auditoría de acciones

---

# 🏗️ ARQUITECTURA

Frontend:
- React
- Vite
- Tailwind

Backend:
- Spring Boot

Base de datos:
- PostgreSQL

Comunicación:
- API REST

---

# 🧠 QUÉ SE DEBE AUTOMATIZAR

- Generación de número de colegiatura
- Cálculo de habilitación
- Validación de pagos
- Generación de boletas
- Generación de certificados PDF
- Control de stock
- Asignación de mesas electorales
- Flujo de denuncias

---

# 🚨 CONSIDERACIONES IMPORTANTES

- No todo documento físico se almacena en sistema
- El sistema debe ser escalable
- Debe ser modular
- No modificar reglas sin validar
- No agregar funcionalidades fuera del alcance sin documentar

---

# 🤖 INSTRUCCIONES PARA IA (CODEX)

Antes de generar código:

1. Leer este archivo completo
2. Revisar estructura del proyecto
3. Respetar reglas de negocio
4. Generar código modular
5. No cambiar arquitectura sin justificación
6. Priorizar claridad y mantenibilidad