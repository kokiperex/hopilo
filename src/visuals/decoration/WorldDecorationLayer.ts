import * as THREE from 'three';
import type { ModelAssetId } from '../../assets/catalog';
import type { VisualAssetLoader } from '../../assets/VisualAssetLoader';
import type { ModelLease } from '../../assets/types';
import type { LevelDefinition } from '../../levels/types';
import { worldDecorationPlacements } from './worldDecorationCatalog';

/** Optional GLB props layered behind the primitive backdrop and gameplay silhouettes. */
export class WorldDecorationLayer {
  private readonly group = new THREE.Group();
  private readonly leases: ModelLease[] = [];
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();
  private disposed = false;

  public constructor(scene: THREE.Scene, private readonly level: LevelDefinition, private readonly assets: VisualAssetLoader) {
    this.group.name = `asset-decoration-${level.world}`;
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
    this.materials.forEach((material) => material.dispose());
    this.materials.clear();
  }

  private async populate(): Promise<void> {
    const placements = worldDecorationPlacements(this.level);
    const ids = [...new Set(placements.map(({ asset }) => asset))];
    const results = await Promise.all(ids.map(async (id) => [id, await this.assets.acquireModel(id)] as const));
    if (this.disposed) {
      results.forEach(([, lease]) => lease?.release());
      return;
    }
    const models = new Map<ModelAssetId, ModelLease>();
    results.forEach(([id, lease]) => {
      if (!lease) return;
      this.leases.push(lease);
      models.set(id, lease);
    });

    placements.forEach((placement) => {
      const lease = models.get(placement.asset);
      if (!lease) return;
      const instance = lease.value.clone(true);
      instance.position.set(placement.position.x, placement.position.y, placement.position.z);
      instance.scale.setScalar(placement.scale);
      instance.rotation.y = placement.rotationY ?? 0;
      instance.rotation.z = placement.rotationZ ?? 0;
      instance.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (placement.tint) child.material = this.material(placement.tint);
        child.castShadow = placement.castShadow ?? false;
        child.receiveShadow = false;
      });
      this.group.add(instance);
    });
  }

  private material(color: string): THREE.MeshStandardMaterial {
    let material = this.materials.get(color);
    if (!material) {
      const space = this.level.world === 'space';
      material = new THREE.MeshStandardMaterial({
        color,
        emissive: space ? color : '#000000',
        emissiveIntensity: space ? 0.18 : 0,
        roughness: space ? 0.42 : 0.86,
        metalness: space ? 0.16 : 0,
        flatShading: true,
      });
      this.materials.set(color, material);
    }
    return material;
  }
}
