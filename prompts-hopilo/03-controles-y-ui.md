# Hopilo — Fase 3: Controles e interfaz de gameplay

Lee la documentación del producto y respeta especialmente `docs/PRODUCT_SPEC.md` y `docs/GAMEPLAY.md`.

Implementa la interfaz de gameplay y los controles multiplataforma:

- HUD consistente.
- Botón de pausa.
- Contador de gemas.
- Indicador de estrellas cuando corresponda.
- Botones táctiles grandes para izquierda, derecha y salto.
- Soporte de teclado con flechas y una tecla de salto.
- Soporte básico de ratón.
- Pausa y reanudación sin perder el estado del nivel.
- Diseño responsive para móviles en horizontal y escritorio.

La disposición debe mantenerse igual en los cuatro mundos. Los controles deben ser fáciles de pulsar, estar separados y no tapar la canica ni los obstáculos importantes.

No incluyas:

- Cronómetro.
- Barra de progreso.
- Joystick.
- Botones arriba/abajo.
- Texto permanente innecesario.
- Caja negra inferior.

Gestiona correctamente pointer events, teclado, foco, touch-action y limpieza de listeners.

Al terminar, ejecuta `npm run build`, corrige errores y explica cómo probar cada método de entrada y la pausa.
