export function createOrientationNotice(root: HTMLElement): HTMLElement {
  const notice = document.createElement('p');
  notice.className = 'orientation-notice';
  notice.textContent = 'Gira el dispositivo para jugar en horizontal';
  root.append(notice);
  return notice;
}
