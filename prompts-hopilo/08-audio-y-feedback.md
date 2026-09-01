# Hopilo — Fase 8: Audio y feedback

Lee `docs/PRODUCT_SPEC.md` y `docs/VISUAL_STYLE.md`.

Añade respuestas breves, claras y aptas para niños para:

- Salto.
- Recogida de gema.
- Activación de checkpoint.
- Golpe o peligro.
- Llegada a la meta.
- Finalización del nivel.

Añade música alegre y discreta para sesiones cortas, si existe una solución gratuita y ligera compatible con el repositorio. Si no hay assets adecuados, utiliza la Web Audio API o deja una arquitectura preparada con sonidos mínimos.

El audio debe:

- Poder silenciarse desde pausa o ajustes.
- Respetar las políticas de autoplay del navegador.
- No bloquear el inicio del juego.
- No utilizar recursos con licencias dudosas.

Añade feedback visual sencillo para gemas, checkpoints, saltos, golpes y meta sin ocultar obstáculos ni controles.

Al terminar, ejecuta `npm run build`, corrige errores y prueba activar, silenciar y reactivar el audio.
