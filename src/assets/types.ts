import type * as THREE from 'three';

export type VisualAssetKind = 'model' | 'texture' | 'ui';

export interface VisualAssetDefinition {
  readonly kind: VisualAssetKind;
  readonly path: string;
  readonly sourceUrl: string;
  readonly purpose: string;
}

/** A reference-counted view of a cached asset. Releasing it never disposes another level's copy. */
export interface AssetLease<T> {
  readonly value: T;
  release(): void;
}

export type ModelLease = AssetLease<THREE.Group>;
export type TextureLease = AssetLease<THREE.Texture>;
