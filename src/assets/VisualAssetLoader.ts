import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetUrl, MODEL_ASSETS, VFX_ASSETS, type ModelAssetId, type VfxAssetId } from './catalog';
import type { AssetLease, ModelLease, TextureLease } from './types';

interface CacheEntry<T> {
  readonly promise: Promise<T>;
  references: number;
  disposeScheduled: boolean;
}

/**
 * Loads optional visuals without delaying gameplay. Parsed resources are cached while a level
 * owns a lease and are released as soon as the last level lets them go.
 */
export class VisualAssetLoader {
  private readonly gltfLoader = new GLTFLoader();
  private readonly textureLoader = new THREE.TextureLoader();
  private readonly models = new Map<ModelAssetId, CacheEntry<THREE.Group>>();
  private readonly textures = new Map<VfxAssetId, CacheEntry<THREE.Texture>>();
  private disposed = false;

  public acquireModel(id: ModelAssetId): Promise<ModelLease | undefined> {
    return this.acquire(
      id,
      this.models,
      () => this.gltfLoader.loadAsync(assetUrl(MODEL_ASSETS[id])).then(({ scene }) => scene),
      (source) => source.clone(true),
      disposeObjectResources,
    );
  }

  public acquireTexture(id: VfxAssetId): Promise<TextureLease | undefined> {
    return this.acquire(
      id,
      this.textures,
      async () => {
        const texture = await this.textureLoader.loadAsync(assetUrl(VFX_ASSETS[id]));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
      },
      (source) => source,
      (texture) => texture.dispose(),
    );
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.models.forEach((entry, id) => this.releaseEntry(id, entry, this.models, disposeObjectResources, true));
    this.textures.forEach((entry, id) => this.releaseEntry(id, entry, this.textures, (texture) => texture.dispose(), true));
  }

  private async acquire<K, T>(
    id: K,
    cache: Map<K, CacheEntry<T>>,
    load: () => Promise<T>,
    clone: (source: T) => T,
    dispose: (source: T) => void,
  ): Promise<AssetLease<T> | undefined> {
    if (this.disposed) return undefined;
    let entry = cache.get(id);
    if (!entry) {
      entry = { promise: load(), references: 0, disposeScheduled: false };
      cache.set(id, entry);
    }
    entry.references += 1;
    try {
      const source = await entry.promise;
      if (this.disposed || entry.disposeScheduled) {
        this.releaseEntry(id, entry, cache, dispose);
        return undefined;
      }
      const value = clone(source);
      let released = false;
      return {
        value,
        release: (): void => {
          if (released) return;
          released = true;
          if (value instanceof THREE.Object3D) value.removeFromParent();
          this.releaseEntry(id, entry, cache, dispose);
        },
      };
    } catch (error) {
      this.releaseEntry(id, entry, cache, dispose);
      console.warn(`[Hopilo] Optional visual asset failed to load: ${String(id)}`, error);
      return undefined;
    }
  }

  private releaseEntry<K, T>(
    id: K,
    entry: CacheEntry<T>,
    cache: Map<K, CacheEntry<T>>,
    dispose: (source: T) => void,
    force = false,
  ): void {
    entry.references = force ? 0 : Math.max(0, entry.references - 1);
    if (entry.references > 0 || entry.disposeScheduled) return;
    entry.disposeScheduled = true;
    if (cache.get(id) === entry) cache.delete(id);
    void entry.promise.then(dispose).catch(() => undefined);
  }
}

function disposeObjectResources(object: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
    childMaterials.forEach((material) => materials.add(material));
  });
  materials.forEach((material) => {
    Object.values(material).forEach((value) => {
      if (value instanceof THREE.Texture) textures.add(value);
    });
    material.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose());
  textures.forEach((texture) => texture.dispose());
}
