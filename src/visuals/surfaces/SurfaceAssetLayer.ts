import * as THREE from 'three';
import type { ModelAssetId } from '../../assets/catalog';
import type { VisualAssetLoader } from '../../assets/VisualAssetLoader';
import type { ModelLease } from '../../assets/types';
import type { LevelDefinition, PlatformDefinition, RampDefinition, WorldId } from '../../levels/types';

const ASSETS_BY_WORLD: Record<WorldId, readonly [ModelAssetId, ModelAssetId]> = {
  beach: ['minigolf-surface', 'minigolf-walkway'],
  wood: ['minigolf-walkway', 'minigolf-surface'],
  space: ['minigolf-surface', 'minigolf-barrier'],
  forest: ['minigolf-surface', 'minigolf-ramp'],
};

const TINT_BY_WORLD: Record<WorldId, string> = {
  beach: '#fff0ad', wood: '#e7ad6c', space: '#c8eaff', forest: '#a8cf69',
};

/** Thin GLB veneers are aligned to platform data; Rapier never sees this layer. */
export class SurfaceAssetLayer {
  private readonly group = new THREE.Group();
  private readonly leases: ModelLease[] = [];
  private readonly material: THREE.MeshStandardMaterial;
  private disposed = false;

  public constructor(scene: THREE.Scene, private readonly level: LevelDefinition, private readonly assets: VisualAssetLoader) {
    this.group.name = `surface-assets-${level.world}`;
    this.material = new THREE.MeshStandardMaterial({
      color: TINT_BY_WORLD[level.world],
      emissive: level.world === 'space' ? '#4d6fa8' : '#000000',
      emissiveIntensity: level.world === 'space' ? 0.16 : 0,
      roughness: level.world === 'space' ? 0.36 : 0.86,
      metalness: level.world === 'space' ? 0.2 : 0,
      flatShading: true,
    });
    scene.add(this.group);
    void this.populate();
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.group.removeFromParent();
    this.group.clear();
    this.leases.forEach((lease) => lease.release());
    this.leases.length = 0;
    this.material.dispose();
  }

  private async populate(): Promise<void> {
    const ids = ASSETS_BY_WORLD[this.level.world];
    const leases = await Promise.all(ids.map((id) => this.assets.acquireModel(id)));
    if (this.disposed) {
      leases.forEach((lease) => lease?.release());
      return;
    }
    leases.forEach((lease) => { if (lease) this.leases.push(lease); });
    const surfaces = [...this.level.platforms, ...this.level.ramps];
    surfaces.forEach((surface, index) => {
      const lease = leases[index % leases.length];
      if (!lease) return;
      this.group.add(this.fitVeneer(lease.value, surface));
    });
  }

  private fitVeneer(source: THREE.Group, surface: PlatformDefinition | RampDefinition): THREE.Group {
    const container = new THREE.Group();
    const model = source.clone(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const modelSize = bounds.getSize(new THREE.Vector3());
    const scaleX = (surface.size.x * 0.975) / Math.max(modelSize.x, 0.001);
    const scaleY = Math.min(0.1, surface.size.y * 0.11) / Math.max(modelSize.y, 0.001);
    const scaleZ = (surface.size.z * 0.91) / Math.max(modelSize.z, 0.001);
    model.scale.set(scaleX, scaleY, scaleZ);
    model.position.set(
      -((bounds.min.x + bounds.max.x) / 2) * scaleX,
      surface.size.y / 2 + 0.018 - bounds.min.y * scaleY,
      -((bounds.min.z + bounds.max.z) / 2) * scaleZ,
    );
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = this.material;
      child.castShadow = false;
      child.receiveShadow = true;
    });
    container.add(model);
    container.position.set(surface.position.x, surface.position.y, surface.position.z);
    container.rotation.z = 'angle' in surface ? surface.angle : surface.rotationZ ?? 0;
    return container;
  }
}
