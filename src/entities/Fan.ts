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
  private readonly gusts: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = [];
  private phase = 0;

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
    for (let index = 0; index < 3; index += 1) {
      const gust = new THREE.Mesh(new THREE.SphereGeometry(0.08 + index * 0.025, 8, 6), new THREE.MeshBasicMaterial({ color: '#e3fbff', transparent: true, opacity: 0.56 - index * 0.1 }));
      gust.position.set(direction * (0.45 + index * 0.42), 0.2 + (index % 2) * 0.28, 0);
      this.gusts.push(gust);
      this.mesh.add(gust);
    }
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    ({ body: this.body, collider: this.collider } = physics.createSensorBox(definition.position, definition.size));
  }

  public applyTo(marble: RAPIER.RigidBody): void {
    const direction = this.definition.direction === 'right' ? 1 : -1;
    marble.addForce({ x: direction * this.definition.force, y: this.definition.lift ?? 0, z: 0 }, true);
  }

  public syncVisual(): void {
    this.phase += 0.18;
    this.blades.rotation.z -= 0.24;
    const direction = this.definition.direction === 'right' ? 1 : -1;
    this.gusts.forEach((gust, index) => {
      gust.position.x = direction * (0.38 + THREE.MathUtils.euclideanModulo(this.phase * 0.8 + index * 0.38, 1.15));
      gust.material.opacity = 0.28 + 0.24 * (0.5 + Math.sin(this.phase * 2 + index) * 0.5);
    });
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeObject(this.mesh);
  }
}
