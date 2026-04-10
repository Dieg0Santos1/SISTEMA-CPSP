# Database - Sistema CPSP

Esta carpeta sirve como apoyo del esquema, pero la fuente oficial de cambios estructurales del proyecto vive en:

- `backend/src/main/resources/db/migration`

## Contenido

- `mysql/01_create_database.sql`: script simple para crear la base local
- `docs/`: notas de modelado y decisiones de BD

## Flujo recomendado

1. Crear la base `sistema_cpsp` en MySQL.
2. Configurar `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` para el backend.
3. Levantar Spring Boot.
4. Dejar que Flyway cree y actualice tablas automaticamente.
