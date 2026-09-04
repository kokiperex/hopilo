import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { PlatformDefinition, RampDefinition } from '../levels/types';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { SurfaceSkinFactory } from '../visuals/surfaces/SurfaceSkinFactory';

export class Platform {
  public readonly mesh: THREE.Group;
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;

  public constructor(private readonly physics: PhysicsWorld, definition: PlatformDefinition | RampDefinition, surfaces: SurfaceSkinFactory) {
    this.mesh = surfaces.create(definition.size, definition.color ?? '#e4b65e');
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    const rotationZ = 'angle' in definition ? definition.angle : definition.rotationZ ?? 0;
    this.mesh.rotation.z = rotationZ;
    const physicsObject = physics.createStaticBox(definition.position, definition.size, rotationZ);
    this.body = physicsObject.body;
    this.collider = physicsObject.collider;
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    this.mesh.removeFromParent();
  }
}
