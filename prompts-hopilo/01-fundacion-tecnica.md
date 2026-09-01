# Hopilo — Fase 1: Fundación técnica

Actúa como lead developer de Hopilo. Lee `AGENTS.md` y toda la documentación de `docs/` antes de modificar código.

Implementa únicamente la fundación técnica del juego:

- Reorganiza el código en capas separadas para `game`, `physics`, `entities`, `levels`, `input`, `ui` y `styles`.
- Mantén TypeScript, Vite, Three.js y Rapier 3D.
- Crea un bucle de juego con paso fijo para Rapier.
- Separa actualización de física y renderizado.
- Prepara resize responsive para móviles horizontales y escritorio.
- Configura una cámara lateral 2.5D con seguimiento suave o una base fácilmente extensible.
- Define tipos base para niveles y entidades.
- Mantén el uso de primitivas de Three.js y materiales ligeros.
- Elimina la escena de prueba solo cuando exista una implementación equivalente.

No implementes todavía navegación, audio, 40 niveles ni sistemas que no sean necesarios para esta fase.

Usa valores configurables en lugar de valores mágicos. Mantén la arquitectura preparada para cambiar el material de la canica sin alterar su física.

Al terminar:

1. Ejecuta `npm run build`.
2. Corrige todos los errores de compilación.
3. Resume los archivos modificados.
4. Indica cómo validar manualmente que la aplicación sigue iniciando.
5. Explica qué queda preparado para la fase del vertical slice.
