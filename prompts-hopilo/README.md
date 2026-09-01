# Prompts de implementación de Hopilo

Estos prompts están pensados para ejecutarse uno por uno en Codex, en orden.

## Orden recomendado

1. `00-auditoria-y-plan.md`
2. `01-fundacion-tecnica.md`
3. `02-vertical-slice.md`
4. `03-controles-y-ui.md`
5. `04-datos-y-carga-de-niveles.md`
6. `05-navegacion-y-progreso.md`
7. `06-contenido-de-los-cuatro-mundos.md`
8. `07-obstaculos-y-entidades.md`
9. `08-audio-y-feedback.md`
10. `08.5-pase-de-arte-visual.md`
11. `09-pulido-y-validacion.md`

Cada prompt debe ejecutarse desde la raíz del repositorio `/Users/jorgeperez/Proyectos/hopilo`.

Reglas de uso:

- Ejecuta una fase por vez.
- No avances a la siguiente si la fase actual no compila.
- Revisa los cambios antes de continuar.
- Si Codex detecta una decisión de producto pendiente, debe explicarla antes de modificar el alcance.
- El objetivo es validar primero un vertical slice jugable y después ampliar el contenido.
