import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { TrampolineDefinition } from '../levels/types';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { disposeObject } from './LevelItems';

/** Friendly, solid bounce pad with a short squash response on every launch. */
export class Trampoline {
  public readonly mesh = new THREE.Group();
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;
  public readonly launchSpeed: number;
  private readonly pad: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  private pulse = 0;

  public constructor(private readonly physics: PhysicsWorld, definition: TrampolineDefinition) {
    const baseMaterial = new THREE.MeshStandardMaterial({ color: definition.color ?? '#ef6f79', roughness: 0.72 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: '#fff4d8', emissive: '#e6a02b', emissiveIntensity: 0.28, roughness: 0.45 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(definition.size.x, definition.size.y, definition.size.z), baseMaterial);
    this.pad = new THREE.Mesh(new THREE.BoxGeometry(definition.size.x * 0.82, definition.size.y * 0.26, definition.size.z * 0.86), trimMaterial);
    this.pad.position.y = definition.size.y * 0.43;
    base.castShadow = this.pad.castShadow = true;
    base.receiveShadow = this.pad.receiveShadow = true;
    this.mesh.add(base, this.pad);
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    ({ body: this.body, collider: this.collider } = physics.createStaticBox(definition.position, definition.size));
    this.launchSpeed = definition.launchSpeed ?? 12;
  }

  public activate(): void {
    this.pulse = 1;
  }

  public syncVisual(): void {
    this.pulse = Math.max(0, this.pulse - 1 / 16);
    const squash = 1 - this.pulse * 0.24;
    this.pad.scale.set(1 + this.pulse * 0.12, squash, 1 + this.pulse * 0.12);
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeObject(this.mesh);
  }
}
