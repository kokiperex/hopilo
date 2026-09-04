import * as THREE from 'three';
import type { InputState } from '../input/InputController';
import type { LevelDefinition } from '../levels/types';
import type { VisualAssetLoader } from '../assets/VisualAssetLoader';
import { PHYSICS_CONFIG } from '../physics/constants';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { Marble } from './Marble';
import { createCheckpoint, createGem, createGoal, createHazard, disposeObject, type CheckpointItem, type GemItem, type GoalItem, type HazardItem } from './LevelItems';
import { MovingPlatform } from './MovingPlatform';
import { Platform } from './Platform';
import { Trampoline } from './Trampoline';
import { Conveyor } from './Conveyor';
import { Fan } from './Fan';
import { Hammer } from './Hammer';
import type { PhysicsEntity } from './types';
import type { MarbleSkinId } from '../skins/skinCatalog';
import { SurfaceSkinFactory } from '../visuals/surfaces/SurfaceSkinFactory';
import { VfxSystem } from '../vfx/VfxSystem';

export interface LevelEvents {
  onJump(): void;
  onGemCollected(total: number): void;
  onCheckpoint(): void;
  onHazard(): void;
  onGoalReached(): void;
  onCompleted(totalGems: number): void;
}

export class LevelEntities {
  public readonly marble: Marble;
  private readonly dynamicEntities: PhysicsEntity[];
  private readonly platforms: Platform[];
  private readonly movingPlatforms: MovingPlatform[];
  private readonly trampolines: Trampoline[];
  private readonly conveyors: Conveyor[];
  private readonly fans: Fan[];
  private readonly hammers: Hammer[];
  private readonly gems: GemItem[];
  private readonly checkpoints: CheckpointItem[];
  private readonly hazards: HazardItem[];
  private readonly goal: GoalItem;
  private readonly surfaceSkins: SurfaceSkinFactory;
  private readonly vfx: VfxSystem;
  private respawnPosition: THREE.Vector3;
  private collectedGems = 0;
  private restartCount = 0;
  private restartCooldown = 0;
  private complete = false;
  private elapsedSeconds = 0;

  public constructor(scene: THREE.Scene, private readonly physics: PhysicsWorld, private readonly level: LevelDefinition, private readonly events: LevelEvents, skinId: MarbleSkinId, assets: VisualAssetLoader) {
    this.surfaceSkins = new SurfaceSkinFactory(level.world);
    this.vfx = new VfxSystem(scene, assets, level.world);
    this.platforms = [...level.platforms, ...level.ramps].map((definition) => new Platform(physics, definition, this.surfaceSkins));
    this.movingPlatforms = level.movingPlatforms.map((definition) => new MovingPlatform(physics, definition, this.surfaceSkins));
    this.trampolines = level.trampolines.map((definition) => new Trampoline(physics, definition));
    this.conveyors = level.conveyors.map((definition) => new Conveyor(physics, definition));
    this.fans = level.fans.map((definition) => new Fan(physics, definition));
    level.fans.forEach((definition) => this.vfx.registerFan(definition));
    this.hammers = level.hammers.map((definition) => new Hammer(physics, definition));
    this.platforms.forEach((platform) => scene.add(platform.mesh));
    this.movingPlatforms.forEach((platform) => scene.add(platform.mesh));
    this.trampolines.forEach((trampoline) => scene.add(trampoline.mesh));
    this.conveyors.forEach((conveyor) => scene.add(conveyor.mesh));
    this.fans.forEach((fan) => scene.add(fan.mesh));
    this.hammers.forEach((hammer) => scene.add(hammer.mesh));
    this.marble = new Marble(physics, level.spawn, level.marble, skinId);
    scene.add(this.marble.mesh);
    this.gems = level.gems.map((definition) => createGem(physics, definition));
    this.checkpoints = level.checkpoints.map((definition) => createCheckpoint(physics, definition));
    this.hazards = level.hazards.map((definition) => createHazard(physics, definition));
    this.goal = createGoal(physics, level.goal);
    this.gems.forEach((gem) => scene.add(gem.mesh));
    this.checkpoints.forEach((checkpoint) => scene.add(checkpoint.mesh));
    this.hazards.forEach((hazard) => scene.add(hazard.mesh));
    scene.add(this.goal.mesh);
    this.respawnPosition = new THREE.Vector3(level.spawn.x, level.spawn.y, level.spawn.z);
    this.dynamicEntities = [...this.movingPlatforms, ...this.hammers, this.marble];
  }

  public beforePhysicsStep(input: InputState): void {
    if (this.complete) return;
    const jumped = this.marble.applyInput(input, [...this.platforms, ...this.movingPlatforms, ...this.trampolines, ...this.conveyors]);
    if (jumped) this.events.onJump();
    if (this.marble.consumeLanding()) this.vfx.emitLanding(this.marble.mesh.position);
    this.dynamicEntities.forEach((entity) => entity.beforePhysicsStep());
    this.applySurfaceEffects();
    this.restartCooldown = Math.max(0, this.restartCooldown - PHYSICS_CONFIG.fixedTimeStep);
    this.evaluateInteractions();
  }

  public syncVisual(interpolation: number, animate = true, deltaSeconds = 1 / 60): void {
    this.dynamicEntities.forEach((entity) => entity.syncVisual(interpolation));
    if (!animate) return;
    this.elapsedSeconds += 1 / 60;
    this.gems.forEach((gem, index) => {
      if (gem.collected) return;
      gem.mesh.rotation.y += 0.05;
      gem.mesh.position.y = gem.definition.position.y + Math.sin(this.elapsedSeconds * 3 + index) * 0.1;
    });
    this.checkpoints.forEach((checkpoint, index) => {
      if (!checkpoint.active) return;
      checkpoint.glow = Math.max(0.28, checkpoint.glow - 1 / 70);
      checkpoint.flagMaterial.emissiveIntensity = checkpoint.glow + Math.sin(this.elapsedSeconds * 5 + index) * 0.06;
    });
    this.trampolines.forEach((trampoline) => trampoline.syncVisual());
    this.conveyors.forEach((conveyor) => conveyor.syncVisual());
    this.fans.forEach((fan) => fan.syncVisual());
    this.goal.mesh.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) child.rotation.y = Math.sin(this.elapsedSeconds * 2) * 0.12;
    });
    this.goal.celebration = Math.max(0, this.goal.celebration - 1 / 42);
    const goalScale = 1 + this.goal.celebration * 0.18;
    this.goal.mesh.scale.set(goalScale, goalScale, goalScale);
    this.vfx.update(deltaSeconds);
  }

  public restart(): void {
    if (this.complete) return;
    this.marble.reset(this.respawnPosition);
    this.restartCount += 1;
    this.restartCooldown = 0.18;
  }

  public get gemTotal(): number {
    return this.gems.length;
  }

  public get restarts(): number {
    return this.restartCount;
  }

  public dispose(): void {
    this.dynamicEntities.forEach((entity) => entity.dispose());
    this.platforms.forEach((platform) => platform.dispose());
    this.trampolines.forEach((trampoline) => trampoline.dispose());
    this.conveyors.forEach((conveyor) => conveyor.dispose());
    this.fans.forEach((fan) => fan.dispose());
    [...this.gems, ...this.checkpoints, ...this.hazards, this.goal].forEach((item) => {
      this.physics.removeBody(item.body);
      disposeObject(item.mesh);
    });
    this.vfx.dispose();
    this.surfaceSkins.dispose();
  }

  private evaluateInteractions(): void {
    this.gems.forEach((gem) => {
      if (gem.collected || !this.physics.world.intersectionPair(this.marble.collider, gem.collider)) return;
      gem.collected = true;
      gem.mesh.visible = false;
      this.collectedGems += 1;
      this.vfx.emitGem(gem.definition.position);
      this.events.onGemCollected(this.collectedGems);
    });
    this.checkpoints.forEach((checkpoint) => {
      if (checkpoint.active || !this.physics.world.intersectionPair(this.marble.collider, checkpoint.collider)) return;
      checkpoint.active = true;
      checkpoint.flagMaterial.color.set('#ffd95a');
      checkpoint.flagMaterial.emissive.set('#d98216');
      checkpoint.glow = 0.7;
      this.respawnPosition.copy(checkpoint.definition.respawn);
      this.events.onCheckpoint();
    });
    const intersectingHazard = this.hazards.find((hazard) => this.physics.world.intersectionPair(this.marble.collider, hazard.collider));
    const hitByHammer = this.hammers.some((hammer) => this.isTouching(hammer.collider));
    if (this.restartCooldown === 0 && (intersectingHazard || hitByHammer || this.marble.body.translation().y < this.level.fallResetY)) {
      if (intersectingHazard?.definition.kind === 'water') this.emitWaterSplash(intersectingHazard);
      this.marble.reactToHazard();
      this.events.onHazard();
      this.restart();
    }
    if (this.physics.world.intersectionPair(this.marble.collider, this.goal.collider)) {
      this.complete = true;
      this.goal.celebration = 1;
      this.vfx.emitGoal(this.goal.definition.position);
      this.events.onGoalReached();
      this.events.onCompleted(this.collectedGems);
    }
  }

  private applySurfaceEffects(): void {
    this.trampolines.forEach((trampoline) => {
      if (!this.isTouching(trampoline.collider)) return;
      if (this.marble.body.linvel().y > 0.2) return;
      const velocity = this.marble.body.linvel();
      this.marble.body.setLinvel({ x: velocity.x, y: trampoline.launchSpeed, z: 0 }, true);
      trampoline.activate();
    });
    this.conveyors.forEach((conveyor) => {
      conveyor.applyTo(this.marble.body, this.isTouching(conveyor.collider));
    });
    this.fans.forEach((fan) => {
      fan.applyTo(this.marble.body, this.physics.world.intersectionPair(this.marble.collider, fan.collider));
    });
  }

  private emitWaterSplash(hazard: HazardItem): void {
    const marblePosition = this.marble.body.translation();
    const surfaceY = hazard.definition.position.y + hazard.definition.size.y / 2 + 0.04;
    this.vfx.emitWater({ x: marblePosition.x, y: surfaceY, z: marblePosition.z });
  }

  private isTouching(collider: import('@dimforge/rapier3d-compat').Collider): boolean {
    let touching = false;
    this.physics.world.contactPair(this.marble.collider, collider, (manifold) => {
      touching ||= manifold.numSolverContacts() > 0;
    });
    return touching;
  }
}
