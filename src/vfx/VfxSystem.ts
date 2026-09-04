import * as THREE from 'three';
import type { VfxAssetId } from '../assets/catalog';
import type { VisualAssetLoader } from '../assets/VisualAssetLoader';
import type { TextureLease } from '../assets/types';
import type { FanDefinition, Vec3Data, WorldId } from '../levels/types';

type BurstKind = 'gem' | 'landing' | 'water' | 'goal';

interface BurstConfig {
  readonly asset: VfxAssetId;
  readonly color: string;
  readonly count: number;
  readonly duration: number;
  readonly gravity: number;
  readonly size: number;
  readonly spread: number;
  readonly lift: number;
}

const BURSTS: Record<BurstKind, BurstConfig> = {
  gem: { asset: 'gem-spark', color: '#76ffd0', count: 7, duration: 0.42, gravity: -0.8, size: 0.34, spread: 1.05, lift: 1.1 },
  landing: { asset: 'landing-dust', color: '#ead2a1', count: 5, duration: 0.36, gravity: -0.25, size: 0.28, spread: 0.75, lift: 0.42 },
  water: { asset: 'water-foam', color: '#dffcff', count: 7, duration: 0.5, gravity: -1.35, size: 0.32, spread: 1.05, lift: 1.2 },
  goal: { asset: 'goal-star', color: '#ffe375', count: 9, duration: 0.78, gravity: -1.7, size: 0.4, spread: 1.45, lift: 1.75 },
};

const LANDING_COLORS: Record<WorldId, string> = {
  beach: '#f5d694', wood: '#d9a775', space: '#c2dfff', forest: '#c2ad78',
};

/** Fixed pools keep short effects allocation-free during gameplay. */
export class VfxSystem {
  private readonly group = new THREE.Group();
  private readonly pools = new Map<BurstKind, BurstPool>();
  private readonly fans: AirStream[] = [];
  private readonly leases: TextureLease[] = [];
  private readonly motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  private reducedMotion = this.motionPreference.matches;
  private disposed = false;

  public constructor(scene: THREE.Scene, private readonly assets: VisualAssetLoader, world: WorldId) {
    this.group.name = 'pooled-vfx';
    scene.add(this.group);
    (Object.keys(BURSTS) as BurstKind[]).forEach((kind) => {
      const config = kind === 'landing' ? { ...BURSTS[kind], color: LANDING_COLORS[world] } : BURSTS[kind];
      this.pools.set(kind, new BurstPool(this.group, config));
    });
    this.motionPreference.addEventListener('change', this.onMotionPreferenceChange);
    void this.loadTextures();
  }

  public registerFan(definition: FanDefinition): void {
    const stream = new AirStream(this.group, definition);
    this.fans.push(stream);
  }

  public emitGem(position: Vec3Data): void {
    this.emit('gem', position);
  }

  public emitLanding(position: Vec3Data): void {
    this.emit('landing', { x: position.x, y: position.y - 0.54, z: position.z - 0.08 });
  }

  public emitWater(position: Vec3Data): void {
    this.emit('water', position);
  }

  public emitGoal(position: Vec3Data): void {
    this.emit('goal', position);
  }

  public update(deltaSeconds: number): void {
    if (this.disposed) return;
    this.pools.forEach((pool) => pool.update(deltaSeconds));
    this.fans.forEach((fan) => fan.update(deltaSeconds, this.reducedMotion));
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.motionPreference.removeEventListener('change', this.onMotionPreferenceChange);
    this.pools.forEach((pool) => pool.dispose());
    this.pools.clear();
    this.fans.forEach((fan) => fan.dispose());
    this.fans.length = 0;
    this.group.removeFromParent();
    this.leases.forEach((lease) => lease.release());
    this.leases.length = 0;
  }

  private emit(kind: BurstKind, position: Vec3Data): void {
    this.pools.get(kind)?.emit(position, this.reducedMotion);
  }

  private async loadTextures(): Promise<void> {
    const assetIds = [...new Set((Object.values(BURSTS).map(({ asset }) => asset) as VfxAssetId[]).concat('fan-air'))];
    const results = await Promise.all(assetIds.map(async (id) => [id, await this.assets.acquireTexture(id)] as const));
    if (this.disposed) {
      results.forEach(([, lease]) => lease?.release());
      return;
    }
    results.forEach(([id, lease]) => {
      if (!lease) return;
      this.leases.push(lease);
      if (id === 'fan-air') this.fans.forEach((fan) => fan.setTexture(lease.value));
      else {
        const kind = (Object.keys(BURSTS) as BurstKind[]).find((candidate) => BURSTS[candidate].asset === id);
        if (kind) this.pools.get(kind)?.setTexture(lease.value);
      }
    });
  }

  private readonly onMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.reducedMotion = event.matches;
  };
}

class BurstPool {
  private readonly emitters: BurstEmitter[];
  private nextEmitter = 0;

  public constructor(parent: THREE.Group, config: BurstConfig) {
    this.emitters = Array.from({ length: 3 }, () => new BurstEmitter(parent, config));
  }

  public emit(position: Vec3Data, reducedMotion: boolean): void {
    const emitter = this.emitters[this.nextEmitter];
    this.nextEmitter = (this.nextEmitter + 1) % this.emitters.length;
    emitter.emit(position, reducedMotion);
  }

  public update(deltaSeconds: number): void {
    this.emitters.forEach((emitter) => emitter.update(deltaSeconds));
  }

  public setTexture(texture: THREE.Texture): void {
    this.emitters.forEach((emitter) => emitter.setTexture(texture));
  }

  public dispose(): void {
    this.emitters.forEach((emitter) => emitter.dispose());
  }
}

class BurstEmitter {
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.PointsMaterial;
  private readonly points: THREE.Points;
  private readonly positions: Float32Array;
  private readonly velocities: Float32Array;
  private age = Number.POSITIVE_INFINITY;
  private count = 0;

  public constructor(parent: THREE.Group, private readonly config: BurstConfig) {
    this.positions = new Float32Array(config.count * 3);
    this.velocities = new Float32Array(config.count * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setDrawRange(0, 0);
    this.material = new THREE.PointsMaterial({
      color: config.color,
      size: config.size,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      alphaTest: 0.025,
      sizeAttenuation: true,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.renderOrder = 3;
    this.points.frustumCulled = false;
    parent.add(this.points);
  }

  public emit(position: Vec3Data, reducedMotion: boolean): void {
    this.count = reducedMotion ? Math.max(2, Math.ceil(this.config.count * 0.45)) : this.config.count;
    this.age = 0;
    this.points.position.set(position.x, position.y, position.z);
    for (let index = 0; index < this.count; index += 1) {
      const angle = (index / this.count) * Math.PI * 2 + (index % 2) * 0.22;
      const energy = 0.68 + (index % 3) * 0.16;
      const offset = index * 3;
      this.positions[offset] = 0;
      this.positions[offset + 1] = 0;
      this.positions[offset + 2] = -0.05 - (index % 2) * 0.05;
      this.velocities[offset] = Math.cos(angle) * this.config.spread * energy;
      this.velocities[offset + 1] = this.config.lift * (0.66 + (index % 4) * 0.12);
      this.velocities[offset + 2] = Math.sin(angle) * this.config.spread * 0.16;
    }
    this.geometry.setDrawRange(0, this.count);
    this.material.opacity = 0.92;
    this.material.size = this.config.size * (reducedMotion ? 0.82 : 1);
    this.geometry.attributes.position.needsUpdate = true;
    this.points.visible = true;
  }

  public update(deltaSeconds: number): void {
    if (!this.points.visible) return;
    this.age += deltaSeconds;
    const progress = this.age / this.config.duration;
    if (progress >= 1) {
      this.points.visible = false;
      this.geometry.setDrawRange(0, 0);
      return;
    }
    for (let index = 0; index < this.count; index += 1) {
      const offset = index * 3;
      this.velocities[offset + 1] += this.config.gravity * deltaSeconds;
      this.positions[offset] += this.velocities[offset] * deltaSeconds;
      this.positions[offset + 1] += this.velocities[offset + 1] * deltaSeconds;
      this.positions[offset + 2] += this.velocities[offset + 2] * deltaSeconds;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.material.opacity = Math.max(0, (1 - progress) * 0.92);
  }

  public setTexture(texture: THREE.Texture): void {
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  public dispose(): void {
    this.points.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
  }
}

class AirStream {
  private readonly geometry = new THREE.BufferGeometry();
  private readonly material = new THREE.PointsMaterial({
    color: '#dffaff', size: 0.3, transparent: true, opacity: 0.58, depthWrite: false, alphaTest: 0.025,
  });
  private readonly points: THREE.Points;
  private readonly positions = new Float32Array(12);
  private phase = 0;

  public constructor(parent: THREE.Group, private readonly definition: FanDefinition) {
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.position.set(definition.position.x, definition.position.y, definition.position.z - 0.08);
    this.points.renderOrder = 2;
    parent.add(this.points);
    this.updatePositions(false);
  }

  public update(deltaSeconds: number, reducedMotion: boolean): void {
    this.phase += deltaSeconds * (reducedMotion ? 0.28 : 0.9);
    this.updatePositions(reducedMotion);
  }

  public setTexture(texture: THREE.Texture): void {
    this.material.map = texture;
    this.material.needsUpdate = true;
  }

  public dispose(): void {
    this.points.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
  }

  private updatePositions(reducedMotion: boolean): void {
    const direction = this.definition.direction === 'right' ? 1 : -1;
    const count = reducedMotion ? 2 : 4;
    for (let index = 0; index < 4; index += 1) {
      const offset = index * 3;
      const travel = THREE.MathUtils.euclideanModulo(this.phase + index * 0.27, 1);
      this.positions[offset] = direction * (-this.definition.size.x * 0.36 + travel * this.definition.size.x * 0.78);
      this.positions[offset + 1] = -this.definition.size.y * 0.22 + (index % 3) * this.definition.size.y * 0.18;
      this.positions[offset + 2] = 0;
    }
    this.geometry.setDrawRange(0, count);
    this.geometry.attributes.position.needsUpdate = true;
  }
}
