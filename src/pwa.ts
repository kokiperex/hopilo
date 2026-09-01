/** Register the production service worker without blocking game startup. */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch((error: unknown) => {
      // A missing service worker should never prevent the game from loading.
      console.warn('Hopilo no pudo activar el modo instalable.', error);
    });
  }, { once: true });
}
