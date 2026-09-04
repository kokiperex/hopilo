# Arquitectura técnica

## Capas principales

- `src/game/`: ciclo principal, escena y cámara.
- `src/physics/`: mundo Rapier, cuerpos y colisiones.
- `src/entities/`: canica, obstáculos, gemas y meta.
- `src/levels/`: tipos, carga y validación de niveles JSON.
- `src/input/`: controles táctiles, teclado y ratón.
- `src/ui/`: HUD, pausa, selección y resultados.
- `src/skins/`: catálogo tipado y fábrica visual de skins de la canica.
- `src/assets/`: catálogo tipado y carga resiliente de assets visuales opcionales.
- `src/visuals/decoration/`: decoración GLB por mundo, sin física.
- `src/visuals/surfaces/`: skins visuales de piso desacoplados de colliders.
- `src/vfx/`: partículas con pooling y fallback sin texturas.
- `src/styles/`: estilos globales y componentes de interfaz.
- `public/assets/`: recursos estáticos ligeros.

## Reglas de implementación

- La física debe actualizarse con un paso fijo.
- El renderizado debe interpolar la posición visual cuando sea necesario.
- La lógica de niveles no debe depender de posiciones escritas directamente en los componentes visuales.
- Los datos de nivel deben poder cambiarse sin modificar el motor principal.
- Mantener los assets opcionales; el MVP debe poder ejecutarse usando primitivas.
- Mantener el collider esférico y las propiedades físicas independientes del skin seleccionado.
- Añadir skins mediante el catálogo compartido, sin condicionales de navegación o física específicos por skin.
- Iniciar cada nivel sin esperar assets visuales; los fallos deben conservar primitivas jugables.
- Mantener leases de modelos/texturas por nivel y liberar la última referencia al salir.
- No importar loaders o modelos visuales desde `src/physics/`.
