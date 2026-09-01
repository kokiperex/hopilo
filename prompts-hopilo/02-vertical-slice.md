# Hopilo — Fase 2: Vertical slice jugable

Lee `AGENTS.md`, `docs/PRODUCT_SPEC.md`, `docs/GAMEPLAY.md`, `docs/LEVEL_DESIGN.md`, `docs/VISUAL_STYLE.md` y `docs/TECHNICAL_ARCHITECTURE.md`.

Construye un único nivel completo y jugable para validar la experiencia antes de crear más contenido.

El nivel debe incluir:

- Spawn de una canica azul de vidrio.
- Movimiento lateral izquierda/derecha.
- Salto.
- Gravedad, aceleración, inercia, fricción y rebote configurables.
- Plataforma de suelo.
- Una rampa.
- Un hueco o zona peligrosa.
- Una gema opcional.
- Un checkpoint.
- Una bandera o portal de meta.
- Reinicio rápido al caer o tocar un peligro.
- Cámara lateral.
- Colisiones físicas estables.
- Finalización del nivel.

La física debe ser tolerante y predecible para un niño de aproximadamente 5 años. Evita que la canica quede atrapada con facilidad.

Mantén la lógica del nivel separada de la lógica del motor. Usa datos configurables para las posiciones.

No añadas cronómetro, barra de progreso, joystick ni controles arriba/abajo.

Al terminar, ejecuta `npm run build`, corrige errores y describe una prueba manual completa: iniciar, moverse, saltar, recoger gema, activar checkpoint, caer, reiniciar y llegar a la meta.
