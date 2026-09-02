import * as THREE from 'three';
import type { WorldId } from '../levels/types';

/**
 * Small, texture-free material vocabulary shared by every playable object.
 * It keeps the four worlds distinct without making the route harder to read.
 */
export interface WorldVisuals {
  readonly surfaceRoughness: number;
  readonly surfaceMetalness: number;
  readonly edgeLift: number;
}

export const WORLD_VISUALS: Record<WorldId, WorldVisuals> = {
  beach: {
    surfaceRoughness: 0.94, surfaceMetalness: 0, edgeLift: 0.045,
  },
  wood: {
    surfaceRoughness: 0.78, surfaceMetalness: 0, edgeLift: 0.04,
  },
  space: {
    surfaceRoughness: 0.38, surfaceMetalness: 0.2, edgeLift: 0.08,
  },
  forest: {
    surfaceRoughness: 0.96, surfaceMetalness: 0, edgeLift: 0.05,
  },
};

export function createSurfaceMaterial(color: string, world: WorldId, side = false): THREE.MeshStandardMaterial {
  const visuals = WORLD_VISUALS[world];
  const tint = new THREE.Color(color);
  tint.offsetHSL(0, 0, side ? -0.16 : 0);
  return new THREE.MeshStandardMaterial({
    color: tint,
    roughness: visuals.surfaceRoughness,
    metalness: visuals.surfaceMetalness,
    flatShading: true,
  });
}

export function createEdgeMaterial(color: string, world: WorldId): THREE.MeshStandardMaterial {
  const tint = new THREE.Color(color);
  tint.offsetHSL(0, 0.03, WORLD_VISUALS[world].edgeLift);
  return new THREE.MeshStandardMaterial({
    color: tint,
    roughness: Math.min(1, WORLD_VISUALS[world].surfaceRoughness + 0.04),
    metalness: WORLD_VISUALS[world].surfaceMetalness,
    flatShading: true,
  });
}

/** A low-poly surface with a light top lip that remains readable on small screens. */
export function createPlatformMesh(size: { x: number; y: number; z: number }, color: string, world: WorldId): THREE.Group {
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), createSurfaceMaterial(color, world, true));
  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(0.2, size.x - 0.08), Math.min(0.13, Math.max(0.06, size.y * 0.16)), Math.max(0.2, size.z - 0.08)),
    createEdgeMaterial(color, world),
  );
  lip.position.y = size.y / 2 + lip.geometry.parameters.height / 2 - 0.015;
  base.castShadow = true;
  base.receiveShadow = lip.receiveShadow = true;
  group.add(base, lip);
  return group;
}

export function disposeVisual(object: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.removeFromParent();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) return;
    geometries.add(child.geometry);
    if (Array.isArray(child.material)) child.material.forEach((material) => materials.add(material));
    else materials.add(child.material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
