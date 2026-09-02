import { LEVEL_CATALOG } from '../levels/levelCatalog';
import { WORLD_META, WORLD_ORDER } from '../levels/worldMeta';
import type { LevelDefinition, WorldId } from '../levels/types';
import { ProgressStore } from '../progress/ProgressStore';
import { isMarbleSkinId, MARBLE_SKINS, type MarbleSkinDefinition } from '../skins/skinCatalog';

export interface ResultViewModel {
  levelId: string;
  collected: number;
  total: number;
  stars: number;
  isNewBest: boolean;
}

export interface NavigationCallbacks {
  onPlay(levelId: string): void;
  onAudioChanged(enabled: boolean): void;
}

export interface Navigation {
  showHome(): void;
  showResult(result: ResultViewModel): void;
  hide(): void;
  dispose(): void;
}

type Screen = 'home' | 'skins' | 'worlds' | 'levels' | 'settings' | 'confirm-reset';

const starIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.7 2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.55l-5.8 3.05 1.1-6.47-4.7-4.58 6.5-.95L12 2.7Z"/></svg>';
const gemIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 7 6.05L12 21.2 5 8.85 12 2.8Z"/><path d="m5 8.85 7 4.05 7-4.05"/></svg>';
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7V5Z"/></svg>';
const lockIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.3 4.3L19 7"/></svg>';

/** Friendly, full-screen navigation that sits above the renderer until a level starts. */
export function createNavigation(root: HTMLElement, progress: ProgressStore, callbacks: NavigationCallbacks): Navigation {
  const element = document.createElement('section');
  element.className = 'game-navigation';
  element.setAttribute('aria-live', 'polite');
  root.append(element);

  let screen: Screen = 'home';
  let selectedWorld: WorldId = 'beach';

  const render = (): void => {
    element.hidden = false;
    element.innerHTML = screen === 'home'
      ? homeMarkup()
      : screen === 'skins'
        ? skinsMarkup()
        : screen === 'worlds'
          ? worldsMarkup()
          : screen === 'levels'
            ? levelsMarkup(selectedWorld)
            : screen === 'settings'
              ? settingsMarkup()
              : resetMarkup();
    bindActions();
    element.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  };

  const setScreen = (next: Screen): void => {
    screen = next;
    render();
  };

  const isUnlocked = (level: LevelDefinition): boolean => {
    const worldLevels = LEVEL_CATALOG.filter(({ world }) => world === level.world);
    const index = worldLevels.findIndex(({ id }) => id === level.id);
    return index === 0 || progress.isUnlocked(level.id) || progress.getLevel(worldLevels[index - 1].id).stars > 0;
  };

  const bindActions = (): void => {
    element.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'skins') setScreen('skins');
        else if (action === 'worlds') setScreen('worlds');
        else if (action === 'home') setScreen('home');
        else if (action === 'settings') setScreen('settings');
        else if (action === 'levels') setScreen('levels');
        else if (action === 'reset') setScreen('confirm-reset');
        else if (action === 'cancel-reset') setScreen('settings');
        else if (action === 'confirm-reset') {
          progress.reset();
          selectedWorld = 'beach';
          setScreen('home');
        } else if (action === 'audio') {
          const enabled = !progress.snapshot.audioEnabled;
          progress.setAudioEnabled(enabled);
          callbacks.onAudioChanged(enabled);
          render();
        } else if (action === 'skin') {
          const skinId = button.dataset.skin;
          if (isMarbleSkinId(skinId)) {
            progress.setSelectedSkin(skinId);
            render();
            element.querySelector<HTMLButtonElement>(`[data-skin="${skinId}"]`)?.focus({ preventScroll: true });
          }
        } else if (action === 'world') {
          const world = button.dataset.world as WorldId;
          if (WORLD_ORDER.includes(world)) {
            selectedWorld = world;
            setScreen('levels');
          }
        } else if (action === 'play') {
          const level = LEVEL_CATALOG.find(({ id }) => id === button.dataset.level);
          if (level && isUnlocked(level)) {
            element.hidden = true;
            callbacks.onPlay(level.id);
          }
        }
      });
    });
  };

  const homeMarkup = (): string => {
    const completed = Object.keys(progress.snapshot.levels).filter((id) => progress.getLevel(id).stars > 0).length;
    return `
      <div class="nav-sky nav-home">
        <div class="nav-sun" aria-hidden="true"></div><div class="nav-cloud nav-cloud-one" aria-hidden="true"></div><div class="nav-cloud nav-cloud-two" aria-hidden="true"></div>
        <div class="nav-content nav-home-content">
          <p class="nav-logo" aria-label="Hopilo"><span>Ho</span>pilo</p>
          <h1>¡Vamos a rodar!</h1>
          <p class="nav-intro">Elige tu canica y rueda hasta la bandera.</p>
          <button class="nav-primary-button" type="button" data-action="skins" data-autofocus>${playIcon}<span>Jugar</span></button>
          <div class="nav-progress-line">${gemIcon}<span>${progress.snapshot.gems} gemas</span><span aria-hidden="true">·</span><span>${completed} niveles</span></div>
          <button class="nav-text-button" type="button" data-action="settings">Ajustes</button>
        </div>
      </div>`;
  };

  const skinArtworkMarkup = (skin: MarbleSkinDefinition): string => `
    <span class="skin-marble ${skin.previewClass}" aria-hidden="true">
      ${skin.previewMotif === 'turkiye' ? '<i class="skin-crescent"></i><i class="skin-star"></i>' : ''}
      ${skin.hasFace ? '<span class="skin-face"><i></i><i></i><b></b></span>' : ''}
    </span>`;

  const skinsMarkup = (): string => `
    <div class="nav-sky nav-skins">
      <header class="nav-header"><button class="nav-back-button" type="button" data-action="home" aria-label="Volver al inicio">←</button><h1>Elige tu canica</h1><span></span></header>
      <div class="skin-picker">
        <div class="skin-grid" role="group" aria-label="Skins disponibles">${MARBLE_SKINS.map((skin) => {
          const selected = skin.id === progress.snapshot.selectedSkinId;
          return `<button class="skin-option${selected ? ' is-selected' : ''}" type="button" data-action="skin" data-skin="${skin.id}" aria-pressed="${selected}" ${selected ? 'data-autofocus' : ''}>
            ${skinArtworkMarkup(skin)}
            <span class="skin-copy"><strong>${skin.name}</strong><small>${skin.description}</small></span>
            <span class="skin-check" aria-hidden="true">${checkIcon}</span>
          </button>`;
        }).join('')}</div>
        <button class="nav-primary-button skin-continue" type="button" data-action="worlds">Seguir ${playIcon}</button>
      </div>
    </div>`;

  const worldsMarkup = (): string => `
    <div class="nav-sky nav-worlds">
      <header class="nav-header"><button class="nav-back-button" type="button" data-action="skins" aria-label="Volver a las canicas">←</button><h1>Elige un mundo</h1><span></span></header>
      <div class="world-grid">${WORLD_ORDER.map((world) => {
        const levels = LEVEL_CATALOG.filter((level) => level.world === world);
        const unlocked = levels.some(isUnlocked);
        const stars = levels.reduce((sum, level) => sum + progress.getLevel(level.id).stars, 0);
        const meta = WORLD_META[world];
        return `<button class="world-tile world-${world}${unlocked ? '' : ' is-locked'}" type="button" data-action="world" data-world="${world}" ${unlocked ? '' : 'disabled'}>
          <span class="world-tile-scene" aria-hidden="true"><i></i><b></b><em></em></span>
          <span class="world-tile-copy"><strong>${meta.shortName}</strong><small>${unlocked ? `${stars} estrellas` : 'Sigue jugando'}</small></span>
          ${unlocked ? '' : `<span class="world-lock">${lockIcon}</span>`}
        </button>`;
      }).join('')}</div>
    </div>`;

  const levelsMarkup = (world: WorldId): string => {
    const meta = WORLD_META[world];
    const levels = LEVEL_CATALOG.filter((level) => level.world === world);
    return `
      <div class="nav-sky nav-levels world-tone-${world}">
        <div class="level-scroll" role="region" aria-label="Lista de niveles de ${meta.name}">
          <div class="level-scroll-heading">
            <header class="nav-header"><button class="nav-back-button" type="button" data-action="worlds" aria-label="Volver a los mundos">←</button><h1>${meta.name}</h1><span></span></header>
            <p class="nav-subtitle">${meta.description}</p>
          </div>
          <div class="level-row">${levels.map((level, index) => {
            const saved = progress.getLevel(level.id);
            const unlocked = isUnlocked(level);
            return `<button class="level-button${unlocked ? '' : ' is-locked'}" type="button" data-action="play" data-level="${level.id}" ${unlocked ? '' : 'disabled'}>
              <span class="level-heading"><span class="level-number">${index + 1}</span><strong>${level.name}</strong></span>
              <span class="level-lesson">${level.lesson}</span>
              <span class="level-stars" aria-label="${saved.stars} de 3 estrellas">${[0, 1, 2].map((star) => `<i class="${star < saved.stars ? 'is-earned' : ''}">${starIcon}</i>`).join('')}</span>
              <span class="level-status">${unlocked ? (saved.stars > 0 ? 'Jugar otra vez' : '¡Vamos!') : lockIcon}</span>
            </button>`;
          }).join('')}</div>
        </div>
      </div>`;
  };

  const settingsMarkup = (): string => `
    <div class="nav-sky nav-settings">
      <header class="nav-header"><button class="nav-back-button" type="button" data-action="home" aria-label="Volver al inicio">←</button><h1>Ajustes</h1><span></span></header>
      <div class="settings-sheet">
        <button class="settings-option" type="button" data-action="audio"><span><strong>Sonido</strong><small>${progress.snapshot.audioEnabled ? 'Activado' : 'Silenciado'}</small></span><i class="toggle${progress.snapshot.audioEnabled ? ' is-on' : ''}" aria-hidden="true"></i></button>
        <button class="settings-reset" type="button" data-action="reset">Reiniciar progreso</button>
      </div>
    </div>`;

  const resetMarkup = (): string => `
    <div class="nav-sky nav-settings">
      <section class="confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="reset-title">
        <h1 id="reset-title">¿Empezamos de nuevo?</h1>
        <p>Se borrarán las estrellas, gemas y niveles desbloqueados de este dispositivo.</p>
        <div><button class="nav-secondary-button" type="button" data-action="cancel-reset" data-autofocus>Cancelar</button><button class="nav-danger-button" type="button" data-action="confirm-reset">Sí, reiniciar</button></div>
      </section>
    </div>`;

  render();
  return {
    showHome: (): void => { screen = 'home'; render(); },
    showResult: (result): void => {
      element.hidden = false;
      const level = LEVEL_CATALOG.find(({ id }) => id === result.levelId);
      if (level) selectedWorld = level.world;
      const next = level ? LEVEL_CATALOG[LEVEL_CATALOG.findIndex(({ id }) => id === level.id) + 1] : undefined;
      const starRow = [0, 1, 2].map((index) => `<i class="${index < result.stars ? 'is-earned' : ''}">${starIcon}</i>`).join('');
      element.innerHTML = `<div class="nav-sky nav-result"><section class="result-sheet"><p class="result-title">¡Meta!</p><div class="result-stars" aria-label="${result.stars} de 3 estrellas">${starRow}</div><p class="result-message">${result.isNewBest ? '¡Nuevo récord de estrellas!' : '¡Lo hiciste muy bien!'}</p><p class="result-gems">${gemIcon}<span>${result.collected} de ${result.total} gemas</span></p><div class="result-actions"><button class="nav-secondary-button" type="button" data-action="levels">Niveles</button><button class="nav-primary-button" type="button" data-action="play" data-level="${next?.id ?? result.levelId}" data-autofocus>${playIcon}<span>${next ? 'Siguiente' : 'Jugar otra vez'}</span></button></div></section></div>`;
      bindActions();
      element.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
    },
    hide: (): void => { element.hidden = true; },
    dispose: (): void => element.remove(),
  };
}
