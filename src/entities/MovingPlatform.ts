import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { MovingPlatformDefinition } from '../levels/types';
import { PHYSICS_CONFIG } from '../physics/constants';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { PhysicsEntity } from './types';
import type { SurfaceSkinFactory } from '../visuals/surfaces/SurfaceSkinFactory';

/** Kinematic solid generated exclusively from a moving-platform level definition. */
export class MovingPlatform implements PhysicsEntity {
  public readonly mesh: THREE.Group;
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;
  private elapsedSeconds = 0;

  public constructor(private readonly physics: PhysicsWorld, private readonly definition: MovingPlatformDefinition, surfaces: SurfaceSkinFactory) {
    this.mesh = surfaces.create(definition.size, definition.color ?? '#d99648');
    const physicsObject = physics.createKinematicBox(definition.position, definition.size);
    this.body = physicsObject.body;
    this.collider = physicsObject.collider;
    this.setPosition(definition.position);
  }

  public beforePhysicsStep(): void {
    this.elapsedSeconds += PHYSICS_CONFIG.fixedTimeStep;
    const phase = (Math.sin(this.elapsedSeconds * this.definition.cyclesPerSecond * Math.PI * 2) + 1) / 2;
    this.body.setNextKinematicTranslation({
      x: THREE.MathUtils.lerp(this.definition.from.x, this.definition.to.x, phase),
      y: THREE.MathUtils.lerp(this.definition.from.y, this.definition.to.y, phase),
      z: THREE.MathUtils.lerp(this.definition.from.z, this.definition.to.z, phase),
    });
  }

  public syncVisual(): void {
    const position = this.body.translation();
    this.mesh.position.set(position.x, position.y, position.z);
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    this.mesh.removeFromParent();
  }

  private setPosition(position: MovingPlatformDefinition['position']): void {
    this.body.setTranslation(position, true);
    this.mesh.position.set(position.x, position.y, position.z);
  }
}
