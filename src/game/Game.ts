import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { LevelEntities } from '../entities/LevelEntities';
import { InputController } from '../input/InputController';
import { LevelLoader } from '../levels/LevelLoader';
import { LEVEL_CATALOG } from '../levels/levelCatalog';
import type { LevelDefinition } from '../levels/types';
import { WORLD_META } from '../levels/worldMeta';
import { PHYSICS_CONFIG } from '../physics/constants';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { ProgressStore } from '../progress/ProgressStore';
import { AudioManager } from '../audio/AudioManager';
import { createOrientationNotice } from '../ui/OrientationNotice';
import { createGameHud, type FeedbackKind, type GameHud } from '../ui/GameHud';
import { createNavigation, type Navigation } from '../ui/Navigation';
import { CameraController } from './CameraController';
import { GAME_CONFIG } from './config';
import { createWorldScene, disposeWorldScene } from './createWorldScene';

export class Game {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(0, 0, 0, 0, GAME_CONFIG.camera.near, GAME_CONFIG.camera.far);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  private readonly timer = new THREE.Timer();
  private readonly input = new InputController();
  private readonly cameraController = new CameraController(this.camera);
  private readonly orientationNotice: HTMLElement;
  private readonly hud: GameHud;
  private readonly navigation: Navigation;
  private readonly progress = new ProgressStore();
  private readonly audio = new AudioManager(this.progress.snapshot.audioEnabled);
  private readonly levelLoader = new LevelLoader(LEVEL_CATALOG);
  private physics: PhysicsWorld | undefined;
  private entities: LevelEntities | undefined;
  private worldScene: THREE.Group | undefined;
  private accumulator = 0;
  private animationFrame = 0;
  private running = false;
  private disposed = false;
  private paused = false;
  private finished = false;
  private pendingLevelId: string | undefined;
  private finishTimer = 0;

  public constructor(private readonly root: HTMLElement) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, GAME_CONFIG.renderer.maxPixelRatio));
    this.renderer.setClearColor(GAME_CONFIG.world.clearColor);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.setAttribute('aria-label', 'Área de juego de Hopilo');
    this.root.append(this.renderer.domElement);
    this.orientationNotice = createOrientationNotice(this.root);
    this.hud = createGameHud(this.root, {
      onPause: () => this.pause(),
      onResume: () => this.resume(),
      onRestart: () => {
        this.entities?.restart();
        this.hud.showFeedback('checkpoint', '¡Desde aquí!');
        this.resume();
      },
      onExit: () => this.exitToHome(),
      onAudioChanged: (enabled) => this.setAudioEnabled(enabled),
    }, this.progress.snapshot.audioEnabled);
    this.input.bindTouchControl(this.hud.leftButton, 'left');
    this.input.bindTouchControl(this.hud.rightButton, 'right');
    this.input.bindTouchControl(this.hud.jumpButton, 'jump');
    this.hud.setVisible(false);
    this.navigation = createNavigation(this.root, this.progress, {
      onPlay: (levelId) => this.startLevel(levelId),
      onAudioChanged: (enabled) => this.setAudioEnabled(enabled),
    });
    window.addEventListener('keydown', this.onPauseKeyDown);
    window.addEventListener('keydown', this.onAudioKeyDown);
    this.root.addEventListener('pointerdown', this.onAudioPointerDown, { capture: true });
  }

  public async start(): Promise<void> {
    await RAPIER.init();
    if (this.disposed) return;
    this.physics = new PhysicsWorld();
    this.resize();
    window.addEventListener('resize', this.resize);
    this.timer.connect(document);
    this.timer.reset();
    this.running = true;
    if (this.pendingLevelId) {
      const levelId = this.pendingLevelId;
      this.pendingLevelId = undefined;
      this.startLevel(levelId);
    }
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onPauseKeyDown);
    window.removeEventListener('keydown', this.onAudioKeyDown);
    this.root.removeEventListener('pointerdown', this.onAudioPointerDown, { capture: true });
    window.clearTimeout(this.finishTimer);
    this.input.dispose();
    this.hud.dispose();
    this.navigation.dispose();
    this.disposeLevel();
    this.physics?.dispose();
    this.timer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.orientationNotice.remove();
    this.audio.dispose();
  }

  private startLevel(levelId: string): void {
    this.audio.activate();
    if (!this.physics) {
      this.pendingLevelId = levelId;
      return;
    }
    const level = this.levelLoader.load(levelId);
    this.disposeLevel();
    this.scene.background = null;
    this.renderer.setClearColor(WORLD_META[level.world].sceneColor);
    this.worldScene = createWorldScene(this.scene, level);
    this.finished = false;
    this.paused = false;
    this.accumulator = 0;
    this.input.clear();
    this.entities = new LevelEntities(this.scene, this.physics, level, {
      onJump: () => this.playFeedback('jump', '¡Hop!'),
      onGemCollected: (collected) => {
        this.hud.updateGemCounter(collected, this.entities?.gemTotal ?? 0);
        this.playFeedback('gem', '¡Gema!');
      },
      onCheckpoint: () => this.playFeedback('checkpoint', '¡Guardado!'),
      onHazard: () => this.playFeedback('hazard', '¡Cuidado!'),
      onGoalReached: () => this.playFeedback('goal', '¡Meta!'),
      onCompleted: (collected) => this.completeLevel(level, collected),
    });
    this.cameraController.snapTo(this.entities.marble.mesh.position);
    this.hud.updateGemCounter(0, this.entities.gemTotal);
    this.hud.updateStars(0);
    this.hud.setVisible(true);
    this.timer.reset();
    this.renderer.domElement.focus({ preventScroll: true });
  }

  private readonly resize = (): void => {
    const width = this.root.clientWidth || window.innerWidth;
    const height = this.root.clientHeight || window.innerHeight;
    const aspect = width / height;
    const halfHeight = GAME_CONFIG.camera.viewHeight / 2;
    this.camera.left = -halfHeight * aspect;
    this.camera.right = halfHeight * aspect;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly frame = (timestamp: number): void => {
    if (!this.running) return;
    this.timer.update(timestamp);
    if (!this.physics || !this.entities) {
      this.renderer.render(this.scene, this.camera);
      this.animationFrame = requestAnimationFrame(this.frame);
      return;
    }
    const delta = Math.min(this.timer.getDelta(), PHYSICS_CONFIG.maxFrameTime);
    this.accumulator += delta;
    let subSteps = 0;
    if (!this.paused) {
      while (!this.paused && this.accumulator >= PHYSICS_CONFIG.fixedTimeStep && subSteps < PHYSICS_CONFIG.maxSubSteps) {
        this.entities.beforePhysicsStep(this.input.state);
        this.physics.step();
        this.accumulator -= PHYSICS_CONFIG.fixedTimeStep;
        subSteps += 1;
      }
      if (subSteps === PHYSICS_CONFIG.maxSubSteps) this.accumulator = 0;
    } else {
      this.accumulator = 0;
    }

    if (this.paused) this.accumulator = 0;
    this.entities.syncVisual(this.accumulator / PHYSICS_CONFIG.fixedTimeStep, !this.paused);
    this.cameraController.update(this.entities.marble.mesh.position, delta);
    this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.frame);
  };

  private pause(): void {
    if (this.paused || this.finished || !this.entities) return;
    this.paused = true;
    this.accumulator = 0;
    this.timer.reset();
    this.input.clear();
    this.hud.showPause();
  }

  private resume(): void {
    if (!this.paused || this.finished) return;
    this.paused = false;
    this.accumulator = 0;
    this.timer.reset();
    this.hud.hidePause();
    this.renderer.domElement.focus({ preventScroll: true });
  }

  private readonly onPauseKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Escape' || event.repeat) return;
    event.preventDefault();
    if (this.paused) this.resume();
    else this.pause();
  };

  private readonly onAudioKeyDown = (event: KeyboardEvent): void => {
    if (!event.repeat && ['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space'].includes(event.code)) this.audio.activate();
  };

  private readonly onAudioPointerDown = (): void => this.audio.activate();

  private setAudioEnabled(enabled: boolean): void {
    this.progress.setAudioEnabled(enabled);
    this.audio.setEnabled(enabled);
    this.hud.setAudioEnabled(enabled);
  }

  private playFeedback(kind: FeedbackKind, message: string): void {
    this.hud.showFeedback(kind, message);
    this.audio.play(kind);
  }

  private completeLevel(level: LevelDefinition, collected: number): void {
    this.input.clear();
    window.clearTimeout(this.finishTimer);
    this.finishTimer = window.setTimeout(() => {
      if (this.finished || !this.entities) return;
      this.finished = true;
      this.paused = true;
      this.audio.play('complete');
      this.hud.showFeedback('complete', '¡Nivel listo!');
      const gemTotal = this.entities.gemTotal;
      const stars = this.calculateStars(collected, gemTotal, this.entities.restarts, level);
      const previousBest = this.progress.getLevel(level.id).stars;
      this.progress.record(level.id, { stars, gems: collected });
      const nextLevel = LEVEL_CATALOG[LEVEL_CATALOG.findIndex(({ id }) => id === level.id) + 1];
      if (nextLevel) this.progress.unlock(nextLevel.id);
      this.hud.updateStars(stars);
      window.setTimeout(() => {
        if (!this.finished) return;
        this.hud.setVisible(false);
        this.navigation.showResult({ levelId: level.id, collected, total: gemTotal, stars, isNewBest: stars > previousBest });
      }, 520);
    }, 540);
  }

  private exitToHome(): void {
    window.clearTimeout(this.finishTimer);
    this.input.clear();
    this.paused = true;
    this.finished = false;
    this.disposeLevel();
    this.hud.hidePause();
    this.hud.setVisible(false);
    this.navigation.showHome();
  }

  private disposeLevel(): void {
    window.clearTimeout(this.finishTimer);
    this.entities?.dispose();
    this.entities = undefined;
    if (this.worldScene) disposeWorldScene(this.worldScene);
    this.worldScene = undefined;
    this.accumulator = 0;
  }

  private calculateStars(collected: number, total: number, restarts: number, level: LevelDefinition): number {
    const criteria = level.starCriteria ?? { majorityGemRatio: 0.7, maxRestartsForThirdStar: 2 };
    let stars = 1;
    if (total > 0 && collected / total >= criteria.majorityGemRatio) stars += 1;
    if (restarts <= criteria.maxRestartsForThirdStar) stars += 1;
    return stars;
  }
}
