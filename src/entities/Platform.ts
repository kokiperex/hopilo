import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { PlatformDefinition, RampDefinition } from '../levels/types';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { WorldId } from '../levels/types';
import { createPlatformMesh, disposeVisual } from '../game/WorldVisuals';

export class Platform {
  public readonly mesh: THREE.Group;
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;

  public constructor(private readonly physics: PhysicsWorld, definition: PlatformDefinition | RampDefinition, world: WorldId) {
    this.mesh = createPlatformMesh(definition.size, definition.color ?? '#e4b65e', world);
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    const rotationZ = 'angle' in definition ? definition.angle : definition.rotationZ ?? 0;
    this.mesh.rotation.z = rotationZ;
    const physicsObject = physics.createStaticBox(definition.position, definition.size, rotationZ);
    this.body = physicsObject.body;
    this.collider = physicsObject.collider;
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeVisual(this.mesh);
  }
}
