# Cambios recientes

## Registro de colegiados

- El RUC queda como el único campo opcional en el formulario de registro de colegiados.
- Los demás campos del registro son obligatorios y se validan tanto en el frontend como en el backend.
- El RUC, cuando se ingresa, debe contener 11 dígitos.

## Número de colegiatura

- El número de colegiatura ya no se genera al registrar un colegiado.
- Los colegiados nuevos se crean inicialmente sin número de colegiatura y con estado `NO_HABILITADO`.
- El número de colegiatura se asigna automáticamente cuando el colegiado realiza un pago que lo deja habilitado.
- Mientras el colegiado no tenga número asignado, el sistema muestra el código como `Pendiente`.

## Validaciones del backend

- Se reforzaron las validaciones para impedir registros incompletos.
- La base de datos permite que `codigo_colegiatura` sea nulo hasta que corresponda asignarlo.
- Se agregó una prueba para confirmar que el número de colegiatura se asigna al registrar un pago habilitante.

## Verificación

- Las pruebas del backend pasan correctamente.
- El lint del frontend no presenta errores; se mantiene una advertencia previa no relacionada con estos cambios.
