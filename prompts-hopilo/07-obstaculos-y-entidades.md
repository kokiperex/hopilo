# Hopilo — Fase 7: Obstáculos y entidades

Lee `docs/PRODUCT_SPEC.md`, `docs/LEVEL_DESIGN.md`, `docs/VISUAL_STYLE.md` y `docs/TECHNICAL_ARCHITECTURE.md`.

Implementa progresivamente estas entidades, manteniendo cada una separada y configurable mediante datos:

1. Plataformas estáticas.
2. Rampas.
3. Huecos y peligros.
4. Gemas.
5. Checkpoints.
6. Meta.
7. Plataformas móviles.
8. Trampolines y resortes.
9. Cintas transportadoras.
10. Ventiladores.
11. Martillos oscilantes o giratorios.

Cada entidad debe tener:

- Representación visual clara.
- Colisión física apropiada.
- Estado propio cuando sea necesario.
- Feedback visual.
- Comportamiento legible para un niño.
- Limpieza correcta al cambiar de nivel.

Implementa solo lo que sea necesario para que el contenido existente funcione y evita crear complejidad prematura.

Al terminar, ejecuta `npm run build`, corrige errores y verifica especialmente colisiones, reinicios y limpieza de cuerpos Rapier.
