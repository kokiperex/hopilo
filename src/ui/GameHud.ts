export interface GameHudCallbacks {
  onPause(): void;
  onResume(): void;
  onRestart(): void;
  onExit(): void;
  onAudioChanged(enabled: boolean): void;
}

export type FeedbackKind = 'jump' | 'gem' | 'checkpoint' | 'hazard' | 'goal' | 'complete';

export interface GameHud {
  readonly leftButton: HTMLButtonElement;
  readonly rightButton: HTMLButtonElement;
  readonly jumpButton: HTMLButtonElement;
  updateGemCounter(collected: number, total: number): void;
  updateStars(earned: number): void;
  showFeedback(kind: FeedbackKind, message: string): void;
  setAudioEnabled(enabled: boolean): void;
  showPause(): void;
  hidePause(): void;
  setVisible(visible: boolean): void;
  dispose(): void;
}

const icon = (name: 'pause' | 'left' | 'right' | 'jump' | 'gem' | 'star'): string => {
  const paths = {
    pause: '<path d="M7 5v14M17 5v14"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    jump: '<path d="M5 14h14M7 10l5-5 5 5M12 5v11"/>',
    gem: '<path d="m12 3 7 6-7 12L5 9l7-6Z"/><path d="m5 9 7 4 7-4M12 13v8"/>',
    star: '<path d="m12 3 2.78 5.64L21 9.55l-4.5 4.39 1.06 6.2L12 17.22l-5.56 2.92 1.06-6.2L3 9.55l6.22-.91L12 3Z"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};

const kenneyControlIcon = (name: 'pause' | 'left' | 'right' | 'jump'): string =>
  `<img class="hud-control-icon" src="${import.meta.env.BASE_URL}assets/kenney/ui/${name === 'left' ? 'direction-left' : name === 'right' ? 'direction-right' : name}.png" alt="" aria-hidden="true">`;

export function createGameHud(root: HTMLElement, callbacks: GameHudCallbacks, audioEnabled = true): GameHud {
  const element = document.createElement('section');
  element.className = 'game-hud';
  element.innerHTML = `
    <div class="hud-top-left">
      <button class="hud-button hud-pause" type="button" aria-label="Pausar">${kenneyControlIcon('pause')}</button>
      <div class="hud-stars" aria-label="Estrellas conseguidas: 0 de 3">
        <span class="hud-star">${icon('star')}</span><span class="hud-star">${icon('star')}</span><span class="hud-star">${icon('star')}</span>
      </div>
    </div>
    <div class="hud-gems" aria-label="Gemas recogidas">${icon('gem')}<span>0 / 1</span></div>
    <p class="hud-toast" role="status" aria-live="polite"></p>
    <div class="hud-controls" aria-label="Controles">
      <button class="hud-button hud-control" type="button" data-action="left" aria-label="Mover a la izquierda">${kenneyControlIcon('left')}</button>
      <button class="hud-button hud-control" type="button" data-action="right" aria-label="Mover a la derecha">${kenneyControlIcon('right')}</button>
    </div>
    <button class="hud-button hud-jump" type="button" data-action="jump" aria-label="Saltar">${kenneyControlIcon('jump')}</button>
    <section class="hud-panel hud-pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-heading" hidden>
      <h1 id="pause-heading">Pausa</h1>
      <div class="hud-panel-actions">
        <button class="hud-panel-button hud-resume" type="button">Seguir</button>
        <button class="hud-panel-button hud-restart" type="button">Reiniciar</button>
        <button class="hud-panel-button hud-audio" type="button" aria-pressed="${String(audioEnabled)}">${audioEnabled ? 'Sonido: sí' : 'Sonido: no'}</button>
        <button class="hud-panel-button hud-exit" type="button">Salir</button>
      </div>
    </section>
  `;
  root.append(element);

  const select = <T extends Element>(selector: string): T => {
    const node = element.querySelector<T>(selector);
    if (!node) throw new Error(`Missing HUD element: ${selector}`);
    return node;
  };
  const leftButton = select<HTMLButtonElement>('[data-action="left"]');
  const rightButton = select<HTMLButtonElement>('[data-action="right"]');
  const jumpButton = select<HTMLButtonElement>('[data-action="jump"]');
  const gemCount = select<HTMLSpanElement>('.hud-gems span');
  const toast = select<HTMLParagraphElement>('.hud-toast');
  const pausePanel = select<HTMLElement>('.hud-pause-panel');
  const starIcons = Array.from(element.querySelectorAll<HTMLElement>('.hud-star'));
  const stars = select<HTMLElement>('.hud-stars');
  const pauseButton = select<HTMLButtonElement>('.hud-pause');
  const resumeButton = select<HTMLButtonElement>('.hud-resume');
  const restartButton = select<HTMLButtonElement>('.hud-restart');
  const audioButton = select<HTMLButtonElement>('.hud-audio');
  let toastTimer = 0;

  const onPause = (): void => callbacks.onPause();
  const onResume = (): void => callbacks.onResume();
  const onRestart = (): void => callbacks.onRestart();
  const onAudio = (): void => callbacks.onAudioChanged(audioButton.getAttribute('aria-pressed') !== 'true');
  const onExit = (): void => callbacks.onExit();
  pauseButton.addEventListener('click', onPause);
  resumeButton.addEventListener('click', onResume);
  restartButton.addEventListener('click', onRestart);
  audioButton.addEventListener('click', onAudio);
  const exitButton = select<HTMLButtonElement>('.hud-exit');
  exitButton.addEventListener('click', onExit);

  return {
    leftButton,
    rightButton,
    jumpButton,
    updateGemCounter: (collected, total): void => {
      gemCount.textContent = `${collected} / ${total}`;
    },
    updateStars: (earned): void => {
      const score = Math.min(3, Math.max(0, earned));
      stars.setAttribute('aria-label', `Estrellas conseguidas: ${score} de 3`);
      starIcons.forEach((star, index) => star.classList.toggle('is-earned', index < score));
    },
    showFeedback: (kind, message): void => {
      window.clearTimeout(toastTimer);
      toast.className = 'hud-toast';
      toast.textContent = message;
      toast.classList.add(`is-${kind}`);
      void toast.offsetWidth;
      toast.classList.add('is-visible');
      toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), kind === 'complete' ? 1450 : 850);
    },
    setAudioEnabled: (enabled): void => {
      audioButton.textContent = enabled ? 'Sonido: sí' : 'Sonido: no';
      audioButton.setAttribute('aria-pressed', String(enabled));
    },
    showPause: (): void => {
      pausePanel.hidden = false;
      pauseButton.disabled = true;
      leftButton.disabled = true;
      rightButton.disabled = true;
      jumpButton.disabled = true;
      resumeButton.focus({ preventScroll: true });
    },
    hidePause: (): void => {
      pausePanel.hidden = true;
      pauseButton.disabled = false;
      leftButton.disabled = false;
      rightButton.disabled = false;
      jumpButton.disabled = false;
      pauseButton.focus({ preventScroll: true });
    },
    setVisible: (visible): void => { element.hidden = !visible; },
    dispose: (): void => {
      window.clearTimeout(toastTimer);
      pauseButton.removeEventListener('click', onPause);
      resumeButton.removeEventListener('click', onResume);
      restartButton.removeEventListener('click', onRestart);
      audioButton.removeEventListener('click', onAudio);
      exitButton.removeEventListener('click', onExit);
      element.remove();
    },
  };
}
