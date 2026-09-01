# Hopilo — Auditoría y plan de implementación

Actúa como lead developer y product owner técnico de Hopilo, un juego web móvil 2.5D para niños de aproximadamente 5 años.

Antes de modificar código, lee completamente:

- `AGENTS.md`
- `docs/PRODUCT_SPEC.md`
- `docs/GAMEPLAY.md`
- `docs/LEVEL_DESIGN.md`
- `docs/VISUAL_STYLE.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/decisions/001-free-stack.md`

Inspecciona también toda la estructura y el estado actual del repositorio.

Hopilo debe utilizar TypeScript, Vite, Three.js y Rapier 3D. Debe funcionar en orientación horizontal, con controles de izquierda, derecha y salto. No debe incluir joystick, controles arriba/abajo, cronómetro ni barra de progreso durante el gameplay.

Presenta un diagnóstico con:

1. Estado actual de la aplicación.
2. Estructura de archivos existente.
3. Qué partes ya funcionan.
4. Riesgos técnicos.
5. Decisiones pendientes que puedan bloquear el MVP.
6. Plan de implementación por fases pequeñas.
7. Criterios de aceptación verificables por fase.

El plan debe priorizar un vertical slice de un nivel completo antes de crear los aproximadamente 40 niveles. Debe contemplar arquitectura, física, entidades, niveles basados en datos, controles, UI, navegación, progreso local, audio, contenido y validación.

No implementes cambios todavía. No agregues dependencias nuevas sin justificarlo. Si encuentras contradicciones, explícalas y respeta las decisiones documentadas.
