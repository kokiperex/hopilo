import RAPIER from '@dimforge/rapier3d-compat';
import type { Vec3Data } from '../levels/types';
import { PHYSICS_CONFIG } from './constants';

export class PhysicsWorld {
  public readonly world: RAPIER.World;

  public constructor() {
    this.world = new RAPIER.World(PHYSICS_CONFIG.gravity);
  }

  public createStaticBox(position: Vec3Data, size: Vec3Data, rotationZ = 0): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed()
        .setTranslation(position.x, position.y, position.z)
        .setRotation({ x: 0, y: 0, z: Math.sin(rotationZ / 2), w: Math.cos(rotationZ / 2) }),
    );
    const collider = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setFriction(PHYSICS_CONFIG.marble.friction)
      .setRestitution(PHYSICS_CONFIG.marble.restitution);
    return { body, collider: this.world.createCollider(collider, body) };
  }

  public createKinematicBox(position: Vec3Data, size: Vec3Data, rotationZ = 0): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased()
        .setTranslation(position.x, position.y, position.z)
        .setRotation({ x: 0, y: 0, z: Math.sin(rotationZ / 2), w: Math.cos(rotationZ / 2) }),
    );
    const collider = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setFriction(PHYSICS_CONFIG.marble.friction)
      .setRestitution(PHYSICS_CONFIG.marble.restitution);
    return { body, collider: this.world.createCollider(collider, body) };
  }

  public createSensorBox(position: Vec3Data, size: Vec3Data): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z));
    const collider = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2).setSensor(true);
    return { body, collider: this.world.createCollider(collider, body) };
  }

  public createSensorBall(position: Vec3Data, radius: number): { body: RAPIER.RigidBody; collider: RAPIER.Collider } {
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z));
    const collider = RAPIER.ColliderDesc.ball(radius).setSensor(true);
    return { body, collider: this.world.createCollider(collider, body) };
  }

  public removeBody(body: RAPIER.RigidBody): void {
    this.world.removeRigidBody(body);
  }

  public step(): void {
    this.world.timestep = PHYSICS_CONFIG.fixedTimeStep;
    this.world.step();
  }

  public dispose(): void {
    this.world.free();
  }
}
