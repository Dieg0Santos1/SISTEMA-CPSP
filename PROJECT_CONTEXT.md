# PROJECT_CONTEXT.md

## Nombre del proyecto
Sistema de Gestión – Colegio de Psicólogos de Lima

## Objetivo general
Desarrollar un sistema web institucional para gestionar colegiados, pagos, habilitación, reportes, módulos administrativos y consulta pública de profesionales colegiados.

## Contexto del negocio
El Colegio de Psicólogos de Lima requiere modernizar su sistema interno para gestionar procesos administrativos clave como colegiatura, pagos, habilitación, reportes y control institucional.

Además, se incorporarán módulos adicionales como eventos, inventario, elecciones y tribunal de honor.

## Alcance del sistema

### Módulo 1 – Gestión de Colegiados
- Registro y edición de colegiados
- Búsqueda por DNI, nombre o número de colegiatura
- Generación automática de número de colegiatura (correlativo)
- Validación de datos (duplicados, formatos, campos obligatorios)
- Registro de fotografía
- Estado del colegiado (activo / inactivo)
- Información completa del colegiado (contacto, etc.)
- Gestión de especialidades múltiples

### Módulo 2 – Pagos y Boletas
- Registro de pagos
- Control de aportaciones mensuales
- Cálculo automático de habilitación (vigencia)
- Generación automática de boletas
- Métodos de pago (efectivo, transferencia, etc.)
- Historial de pagos por colegiado
- Validación de pagos duplicados
- Ítem de habilitación exonerado del IGV (S/10 mensual)
- Venta de papel de constancia con numeración controlada

### Módulo 3 – Reportes y Consulta Pública
- Reportes administrativos
- Reportes por rango de fechas
- Reporte de ingresos
- Consulta pública de colegiados
- Estado de habilitación
- Generación de certificados PDF

### Módulo 4 – Módulos Administrativos Especiales

#### Eventos
- Registro de asistentes
- Control de presentes entregados

#### Inventario
- Registro de materiales
- Control de stock
- Venta de materiales
- Historial de movimientos

#### Elecciones
- Validación de colegiados habilitados
- Generación aleatoria de mesas electorales
- Registro del proceso electoral

#### Tribunal de Honor
- Registro de denuncias
- Evaluación de casos
- Seguimiento
- Registro de sentencias

#### Especialidades
- Segunda especialidad
- Tercera especialidad
- Relación colegiado-especialidades

## Reglas de negocio
- Número de colegiatura es correlativo
- Pago de aportaciones habilita 3 meses
- Solo colegiados habilitados pueden votar
- Toda acción debe registrarse (auditoría)
- Generación obligatoria de boletas
- Control de numeración en documentos físicos
- Control de acceso por roles

## Roles del sistema
- Administrador
- Secretaría
- Tesorería
- Administración
- Público

## Stack tecnológico

### Frontend
- React
- Vite
- Tailwind

### Backend
- Java + Spring Boot

### Base de datos
- PostgreSQL

## Arquitectura general
- Frontend consume API REST
- Backend maneja lógica de negocio
- Base de datos relacional
- Autenticación por sesión o JWT

## Organización del equipo
- Dev 1: Backend + DB + lógica
- Dev 2: Frontend + UI + integración
- Ambos revisan código

## Flujo Git
- main (estable)
- develop (integración)
- feature/*
- fix/*

## Prioridad de desarrollo
1. Base del sistema
2. Colegiados
3. Pagos
4. Reportes
5. Módulos especiales
6. Integración
7. Pruebas

## Nota para Codex
- Leer este archivo antes de generar código
- Respetar reglas de negocio
- No romper arquitectura
- Generar código modular y claro