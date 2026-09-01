# Seguridad

No incluyas secretos, claves, archivos `.env` ni datos personales en incidencias,
pull requests o commits. Antes de publicar, revisa los archivos preparados con
`git status` y `git diff --cached`.

Si encuentras una vulnerabilidad, usa las *private vulnerability reporting*
de GitHub en lugar de abrir una incidencia pública. Este proyecto es un sitio
estático: el flujo de GitHub Pages no necesita secretos ni tokens adicionales.
