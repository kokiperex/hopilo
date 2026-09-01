# Hopilo

Juego web 2.5D de obstáculos para niños, construido con TypeScript, Vite,
Three.js y Rapier 3D. Se juega en horizontal con izquierda, derecha y salto.

## Desarrollo

Requiere Node.js 22 o posterior.

```bash
npm ci
npm run dev
```

Para generar una versión de producción:

```bash
npm run build
```

La versión de producción es una PWA instalable: incluye manifest, íconos de la
propuesta de la bandera y un service worker para abrir el juego sin conexión
después de la primera visita. La instalación se ofrece desde el menú del
navegador cuando el dispositivo lo permite.

## Publicación en GitHub Pages

El flujo [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
compila el sitio y publica únicamente `dist/` después de cada push a `main`.
No utiliza secretos. Las rutas de los recursos se construyen desde la base de
Vite, por lo que funcionan tanto en un sitio de usuario como en un repositorio
`https://<usuario>.github.io/hopilo/`.

Tras subir el primer commit:

1. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como fuente.
2. Espera al flujo **Deploy GitHub Pages**; la URL publicada aparecerá en su ejecución.
3. Activa *private vulnerability reporting* en **Settings → Code security and analysis**.

## Seguridad y licencias

- `.gitignore` excluye dependencias, compilados, reportes de pruebas, archivos
  locales y extensiones habituales de claves.
- `package-lock.json` fija el árbol de dependencias y Dependabot abre
  actualizaciones semanales para npm y GitHub Actions.
- El código se distribuye bajo [MIT](LICENSE). Los recursos de Kenney incluidos
  en `public/assets/kenney/` son CC0; conserva su
  [aviso de licencia](public/assets/kenney/LICENSE.txt).

Consulta [SECURITY.md](SECURITY.md) para informar vulnerabilidades.
