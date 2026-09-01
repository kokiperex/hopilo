import type RAPIER from '@dimforge/rapier3d-compat';
import type * as THREE from 'three';

export interface PhysicsEntity {
  readonly body: RAPIER.RigidBody;
  readonly mesh: THREE.Object3D;
  beforePhysicsStep(): void;
  syncVisual(interpolation: number): void;
  dispose(): void;
}
