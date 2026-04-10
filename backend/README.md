# Backend - Sistema CPSP

Base backend con Spring Boot 3.5, Java 21, MySQL y Flyway.

## Stack

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Flyway
- MySQL
- Actuator

## Estructura inicial

- `common/`: configuracion compartida, manejo de errores y utilidades transversales
- `system/`: endpoints tecnicos del sistema
- `tesoreria/`: base del modulo de tesoreria para resumen, conceptos y series
- `src/main/resources/db/migration`: migraciones versionadas

## Variables de entorno

Puedes copiar `.env.example` o definir estas variables en tu terminal:

- `SPRING_PROFILES_ACTIVE=local`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

## Ejecucion

```powershell
cd backend
./mvnw spring-boot:run
```

## Endpoints iniciales

- `GET /api/v1/system/status`
- `GET /api/v1/tesoreria/resumen`
- `GET /api/v1/tesoreria/conceptos-cobro`
- `GET /api/v1/tesoreria/comprobantes/series`

## Nota sobre base de datos

El backend usa Flyway, asi que al iniciar contra una base vacia creara el esquema y cargara datos base del modulo de tesoreria.
