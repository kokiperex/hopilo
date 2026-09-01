import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { PlatformDefinition, RampDefinition } from '../levels/types';
import type { PhysicsWorld } from '../physics/PhysicsWorld';

export class Platform {
  public readonly mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;

  public constructor(private readonly physics: PhysicsWorld, definition: PlatformDefinition | RampDefinition) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(definition.size.x, definition.size.y, definition.size.z),
      new THREE.MeshStandardMaterial({ color: definition.color ?? '#e4b65e', roughness: 0.9 }),
    );
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    const rotationZ = 'angle' in definition ? definition.angle : definition.rotationZ ?? 0;
    this.mesh.rotation.z = rotationZ;
    this.mesh.receiveShadow = true;
    const physicsObject = physics.createStaticBox(definition.position, definition.size, rotationZ);
    this.body = physicsObject.body;
    this.collider = physicsObject.collider;
  }

  public dispose(): void {
    this.mesh.removeFromParent();
    this.physics.removeBody(this.body);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
