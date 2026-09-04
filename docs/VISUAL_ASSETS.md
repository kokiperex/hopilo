# Arquitectura de assets visuales

## Principio

Los assets de Kenney son una capa de presentación opcional. Los datos de nivel siguen describiendo posiciones y tamaños; `PhysicsWorld` continúa creando todos los cuerpos y colliders exclusivamente con primitivas de Rapier.

## Capas

- `src/assets/catalog.ts`: registro tipado único de modelos, sprites VFX y piezas de UI con ruta, fuente y propósito.
- `src/assets/VisualAssetLoader.ts`: carga GLB/PNG asíncrona, caché por asset, leases con conteo de referencias, recuperación ante error y liberación al salir del nivel.
- `src/visuals/decoration/`: selección de props por mundo. Mini Forest solo aparece en `forest`; las banderas y piezas de minigolf se montan detrás del plano jugable.
- `src/visuals/surfaces/`: superficie primitiva por mundo más una chapa GLB fina alineada a los datos de cada plataforma/rampa.
- `src/vfx/VfxSystem.ts`: pools fijos de partículas y corrientes de ventilador; usa sprites de Particle Pack y cae a puntos de color si no cargan.
- `src/ui/`: usa las piezas seleccionadas de UI Pack con SVG/CSS ya existentes como fallback.

## Resiliencia y ciclo de vida

El nivel se crea antes de esperar cualquier red o decodificación de GLB. Cada capa comprueba si fue destruida antes de insertar un asset resuelto. Al salir del nivel:

1. se retiran entidades y partículas;
2. se liberan los leases de texturas y modelos;
3. la última referencia dispone geometrías, materiales y texturas del asset cacheado;
4. las primitivas del fondo se disponen por separado.

Un fallo de asset se registra como advertencia y no se propaga al bucle de juego. La base temática de primitivas siempre permanece visible y jugable.

## Presupuesto

La selección nueva ocupa aproximadamente 223 KiB sin comprimir en disco: 60 KiB de Minigolf, 109 KiB de Mini Forest, 51 KiB de VFX y 3 KiB de UI. Los cinco sprites VFX se redujeron a 128×128. Se eliminaron los modelos antiguos no usados, de modo que el directorio completo de Kenney resulta más pequeño que antes de esta mejora.
