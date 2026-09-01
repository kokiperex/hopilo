# Hopilo — Fase 4: Datos y carga de niveles

Lee `docs/PRODUCT_SPEC.md`, `docs/LEVEL_DESIGN.md` y `docs/TECHNICAL_ARCHITECTURE.md`.

Implementa un sistema de niveles definido mediante datos, sin escribir la lógica de cada nivel directamente en los componentes visuales.

La estructura debe permitir como mínimo:

- `id`
- `world`
- `spawn`
- `platforms`
- `ramps`
- `hazards`
- `movingPlatforms`
- `gems`
- `checkpoints`
- `goal`

Crea:

- Tipos TypeScript claros.
- Datos de ejemplo para el vertical slice.
- Carga de niveles.
- Validación básica.
- Conversión de datos a entidades Three.js y cuerpos Rapier.
- Separación entre configuración, renderizado y física.
- Un mecanismo para añadir niveles sin modificar el motor principal.

No crees todavía los 40 niveles. Prioriza una estructura extensible y validable.

Al terminar, ejecuta `npm run build`, corrige errores y muestra cómo añadir un nivel nuevo modificando únicamente sus datos.
