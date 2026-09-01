# Arquitectura técnica

## Capas principales

- `src/game/`: ciclo principal, escena y cámara.
- `src/physics/`: mundo Rapier, cuerpos y colisiones.
- `src/entities/`: canica, obstáculos, gemas y meta.
- `src/levels/`: tipos, carga y validación de niveles JSON.
- `src/input/`: controles táctiles, teclado y ratón.
- `src/ui/`: HUD, pausa, selección y resultados.
- `src/styles/`: estilos globales y componentes de interfaz.
- `public/assets/`: recursos estáticos ligeros.

## Reglas de implementación

- La física debe actualizarse con un paso fijo.
- El renderizado debe interpolar la posición visual cuando sea necesario.
- La lógica de niveles no debe depender de posiciones escritas directamente en los componentes visuales.
- Los datos de nivel deben poder cambiarse sin modificar el motor principal.
- Mantener los assets opcionales; el MVP debe poder ejecutarse usando primitivas.
