import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { FanDefinition } from '../levels/types';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { disposeObject } from './LevelItems';

/** Sensor-based airflow: vivid blades and particles show which way it pushes. */
export class Fan {
  public readonly mesh = new THREE.Group();
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;
  private readonly blades = new THREE.Group();
  private hasPushedMarble = false;

  public constructor(private readonly physics: PhysicsWorld, private readonly definition: FanDefinition) {
    const direction = definition.direction === 'right' ? 1 : -1;
    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 0.3, 12), new THREE.MeshStandardMaterial({ color: definition.color ?? '#58a9c9', roughness: 0.58 }));
    housing.rotation.x = Math.PI / 2;
    housing.position.set(-direction * (definition.size.x / 2 - 0.42), -definition.size.y * 0.2, 0);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshStandardMaterial({ color: '#fff5cf', emissive: '#dfad4f', emissiveIntensity: 0.4 }));
    this.blades.add(hub);
    for (let index = 0; index < 4; index += 1) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.1), new THREE.MeshStandardMaterial({ color: '#e9fbff', roughness: 0.38 }));
      blade.position.x = 0.31;
      blade.rotation.z = (index * Math.PI) / 2;
      this.blades.add(blade);
    }
    this.blades.position.copy(housing.position);
    this.mesh.add(housing, this.blades);
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    ({ body: this.body, collider: this.collider } = physics.createSensorBox(definition.position, definition.size));
  }

  /** Gives one gentle push per entry, rather than accelerating the marble forever. */
  public applyTo(marble: RAPIER.RigidBody, isInAirflow: boolean): void {
    if (!isInAirflow) {
      this.hasPushedMarble = false;
      return;
    }
    if (this.hasPushedMarble) return;

    const direction = this.definition.direction === 'right' ? 1 : -1;
    const velocity = marble.linvel();
    const maxSpeed = this.definition.maxSpeed;
    if (maxSpeed === undefined || direction * velocity.x < maxSpeed) {
      marble.applyImpulse({ x: direction * this.definition.impulse, y: this.definition.lift ?? 0, z: 0 }, true);
    }
    this.hasPushedMarble = true;
  }

  public syncVisual(): void {
    this.blades.rotation.z -= 0.24;
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeObject(this.mesh);
  }
}
