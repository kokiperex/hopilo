# Instrucciones para Hopilo

## Objetivo

Hopilo es un juego web 2.5D de obstáculos en el que una canica atraviesa circuitos coloridos. Está pensado principalmente para niños de aproximadamente 5 años.

## Stack aprobado

- TypeScript
- Vite
- Three.js
- Rapier 3D
- HTML y CSS

Todas las herramientas y dependencias deben ser gratuitas o de código abierto.

## Reglas de producto

- Mantener el juego en orientación horizontal.
- Usar controles de izquierda, derecha y salto.
- No añadir botones arriba/abajo ni joystick en el MVP.
- No incluir contador de tiempo ni indicador de progreso durante el gameplay.
- Mantener una interfaz consistente entre los cuatro mundos.
- Usar una canica azul de vidrio en el MVP.
- Mantener los gráficos low-poly, ligeros y legibles.
- Evitar compras, anuncios y microtransacciones.

## Reglas técnicas

- Preferir geometría reutilizable y primitivas de Three.js.
- Describir los niveles mediante datos configurables, preferentemente JSON.
- Separar renderizado, física, entrada, niveles, entidades e interfaz.
- Evitar dependencias nuevas si la funcionalidad puede resolverse con la plataforma web.
- Diseñar primero para móviles y validar también en escritorio.
- No modificar decisiones de producto documentadas sin actualizar `docs/PRODUCT_SPEC.md`.

## Verificación

Después de cambios importantes, ejecutar:

```bash
npm run build
```

Consultar estos documentos antes de implementar cambios relacionados:

- `docs/PRODUCT_SPEC.md` — alcance y decisiones del producto.
- `docs/GAMEPLAY.md` — bucle de juego y controles.
- `docs/LEVEL_DESIGN.md` — reglas para diseñar niveles.
- `docs/VISUAL_STYLE.md` — dirección visual.
- `docs/TECHNICAL_ARCHITECTURE.md` — organización técnica.
- `docs/decisions/` — decisiones técnicas registradas.
