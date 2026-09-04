# Decisión 002: assets Kenney como capas visuales opcionales

## Estado

Aceptada.

## Decisión

Hopilo utilizará un subconjunto curado de Minigolf Kit, Mini Forest, Particle Pack y UI Pack de Kenney, todos CC0. Los modelos y sprites se registran en un catálogo tipado y se cargan de forma asíncrona mediante leases con caché y conteo de referencias.

Los pisos conservan una malla primitiva temática alineada al collider y pueden recibir una chapa GLB fina. La decoración de mundo, VFX y piezas de UI son capas independientes. Ningún asset externo crea colliders ni modifica datos de nivel, fuerzas, controles o reglas de progreso.

## Motivo

Esta separación aumenta el acabado visual sin convertir la disponibilidad de un archivo externo en un requisito para comenzar o completar un nivel. También permite reutilizar geometría y texturas, limitar memoria y añadir o retirar assets por mundo desde un registro central.

## Consecuencias

- Si falla un GLB, permanece la superficie y decoración primitiva específica del mundo.
- Si falla un sprite, los VFX usan puntos de color y la UI conserva sus SVG/CSS.
- La carga no bloquea el inicio del nivel.
- Los recursos se liberan al salir del nivel y al destruir el juego.
- La física permanece verificablemente aislada de `src/assets/`, `src/visuals/` y `src/vfx/`.
