export function createOrientationNotice(root: HTMLElement): HTMLElement {
  const notice = document.createElement('div');
  notice.className = 'orientation-notice';
  notice.setAttribute('role', 'status');

  const illustration = document.createElement('img');
  illustration.src = `${import.meta.env.BASE_URL}assets/ui/orientation-rotate.png`;
  illustration.alt = 'Teléfono girando desde vertical hasta horizontal';

  const message = document.createElement('span');
  message.textContent = 'Gira el dispositivo para jugar en horizontal';

  notice.append(illustration, message);
  root.append(notice);
  return notice;
}
