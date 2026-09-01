import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { ConveyorDefinition } from '../levels/types';
import { PHYSICS_CONFIG } from '../physics/constants';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { disposeObject } from './LevelItems';

/** Fixed physical belt with moving slats that make its direction obvious. */
export class Conveyor {
  public readonly mesh = new THREE.Group();
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;
  private readonly slats: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[] = [];
  private phase = 0;

  public constructor(private readonly physics: PhysicsWorld, private readonly definition: ConveyorDefinition) {
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(definition.size.x, definition.size.y, definition.size.z),
      new THREE.MeshStandardMaterial({ color: definition.color ?? '#536d91', roughness: 0.72 }),
    );
    belt.castShadow = belt.receiveShadow = true;
    this.mesh.add(belt);
    const slatMaterial = new THREE.MeshStandardMaterial({ color: '#d6f4f5', emissive: '#4c9ca5', emissiveIntensity: 0.18, roughness: 0.52 });
    const count = Math.max(3, Math.ceil(definition.size.x / 0.46));
    for (let index = 0; index < count; index += 1) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.18, definition.size.y * 0.12, definition.size.z * 0.88), slatMaterial);
      slat.position.set(-definition.size.x / 2 + ((index + 0.5) * definition.size.x) / count, definition.size.y * 0.54, 0);
      this.slats.push(slat);
      this.mesh.add(slat);
    }
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    ({ body: this.body, collider: this.collider } = physics.createStaticBox(definition.position, definition.size));
  }

  public applyTo(marble: RAPIER.RigidBody, touching: boolean): void {
    if (!touching) return;
    marble.addForce({ x: this.definition.speed * 16, y: 0, z: 0 }, true);
  }

  public syncVisual(): void {
    this.phase = (this.phase + this.definition.speed * PHYSICS_CONFIG.fixedTimeStep) % this.definition.size.x;
    this.slats.forEach((slat, index) => {
      const start = -this.definition.size.x / 2 + ((index + 0.5) * this.definition.size.x) / this.slats.length;
      slat.position.x = THREE.MathUtils.euclideanModulo(start + this.phase + this.definition.size.x / 2, this.definition.size.x) - this.definition.size.x / 2;
    });
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeObject(this.mesh);
  }
}
