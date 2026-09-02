import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import type { InputState } from '../input/InputController';
import type { MarbleDefinition, Vec3Data } from '../levels/types';
import { PHYSICS_CONFIG } from '../physics/constants';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { PhysicsEntity } from './types';
import { disposeVisual } from '../game/WorldVisuals';

const DEFAULT_RADIUS = 0.65;

interface GroundSurface {
  readonly collider: RAPIER.Collider;
}

export class Marble implements PhysicsEntity {
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;
  /** Position root: the sphere can roll while the glow trail stays screen-readable. */
  public readonly mesh = new THREE.Group();
  private readonly sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  private readonly trail: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = [];
  private readonly previousPosition = new THREE.Vector3();
  private readonly currentPosition = new THREE.Vector3();
  private jumpWasDown = false;
  private jumpBufferSeconds = 0;
  private secondsSinceGrounded = 0;
  private jumpPulse = 0;
  private hitPulse = 0;

  public constructor(private readonly physics: PhysicsWorld, spawn: Vec3Data, definition: MarbleDefinition = {}) {
    const radius = definition.radius ?? DEFAULT_RADIUS;
    const materialConfig = definition.material ?? {
      color: '#59b9ff',
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.08,
    };
    this.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 20, 14),
      new THREE.MeshPhysicalMaterial({
        ...materialConfig,
        clearcoat: 0.75,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.95,
      }),
    );
    this.sphere.castShadow = true;
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.4, 10, 7),
      new THREE.MeshBasicMaterial({ color: '#d5f6ff', transparent: true, opacity: 0.4 }),
    );
    glow.position.set(-radius * 0.38, radius * 0.28, radius * 0.38);
    this.sphere.add(glow);
    this.mesh.add(this.sphere);
    for (let index = 0; index < 4; index += 1) {
      const trailPoint = new THREE.Mesh(
        new THREE.SphereGeometry(radius * (0.16 - index * 0.022), 8, 6),
        new THREE.MeshBasicMaterial({ color: '#7ee7ff', transparent: true, opacity: 0 }),
      );
      trailPoint.renderOrder = 1;
      this.trail.push(trailPoint);
      this.mesh.add(trailPoint);
    }

    this.body = physics.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(spawn.x, spawn.y, spawn.z)
        .setLinearDamping(PHYSICS_CONFIG.marble.linearDamping)
        .setAngularDamping(PHYSICS_CONFIG.marble.angularDamping)
        .enabledTranslations(true, true, false)
        .setCcdEnabled(true),
    );
    this.collider = physics.world.createCollider(
      RAPIER.ColliderDesc.ball(radius)
        .setDensity(PHYSICS_CONFIG.marble.density)
        .setFriction(PHYSICS_CONFIG.marble.friction)
        .setRestitution(PHYSICS_CONFIG.marble.restitution),
      this.body,
    );
    this.setPosition(spawn);
  }

  public applyInput(input: InputState, platforms: readonly GroundSurface[]): boolean {
    const horizontalDirection = Number(input.right) - Number(input.left);
    const velocity = this.body.linvel();
    const targetSpeed = horizontalDirection * PHYSICS_CONFIG.marble.maxHorizontalSpeed;
    const acceleration = PHYSICS_CONFIG.marble.moveAcceleration * PHYSICS_CONFIG.fixedTimeStep;
    const nextHorizontalSpeed = THREE.MathUtils.damp(velocity.x, targetSpeed, 20, PHYSICS_CONFIG.fixedTimeStep);
    this.body.setLinvel(
      {
        x: THREE.MathUtils.clamp(nextHorizontalSpeed, velocity.x - acceleration, velocity.x + acceleration),
        y: velocity.y,
        z: 0,
      },
      true,
    );

    if (input.jump && !this.jumpWasDown) {
      this.jumpBufferSeconds = PHYSICS_CONFIG.marble.jumpBufferTime;
    } else {
      this.jumpBufferSeconds = Math.max(0, this.jumpBufferSeconds - PHYSICS_CONFIG.fixedTimeStep);
    }

    if (this.isOnPlatform(platforms)) {
      this.secondsSinceGrounded = 0;
    } else {
      this.secondsSinceGrounded += PHYSICS_CONFIG.fixedTimeStep;
    }
    let jumped = false;
    if (this.jumpBufferSeconds > 0 && this.secondsSinceGrounded <= PHYSICS_CONFIG.marble.coyoteTime) {
      this.body.setLinvel({ x: this.body.linvel().x, y: PHYSICS_CONFIG.marble.jumpSpeed, z: 0 }, true);
      this.secondsSinceGrounded = Number.POSITIVE_INFINITY;
      this.jumpBufferSeconds = 0;
      this.jumpPulse = 1;
      jumped = true;
    }
    this.jumpWasDown = input.jump;
    return jumped;
  }

  public reset(position: Vec3Data): void {
    this.body.setTranslation(position, true);
    this.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    this.secondsSinceGrounded = PHYSICS_CONFIG.marble.coyoteTime;
    this.jumpBufferSeconds = 0;
    this.jumpWasDown = false;
    this.setPosition(position);
  }

  public beforePhysicsStep(): void {
    const translation = this.body.translation();
    this.previousPosition.set(translation.x, translation.y, translation.z);
  }

  public syncVisual(interpolation: number): void {
    const translation = this.body.translation();
    this.currentPosition.set(translation.x, translation.y, translation.z);
    this.mesh.position.lerpVectors(this.previousPosition, this.currentPosition, interpolation);
    const rotation = this.body.rotation();
    this.sphere.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    this.jumpPulse = Math.max(0, this.jumpPulse - 0.12);
    this.hitPulse = Math.max(0, this.hitPulse - 0.09);
    const stretch = 1 + this.jumpPulse * 0.13;
    const squish = 1 - this.jumpPulse * 0.1 - this.hitPulse * 0.08;
    this.sphere.scale.set(stretch, Math.max(0.82, squish), stretch);
    this.sphere.material.emissive.set(this.hitPulse > 0 ? '#db5c5c' : '#000000');
    this.sphere.material.emissiveIntensity = this.hitPulse * 0.38;
    this.updateTrail();
  }

  public reactToHazard(): void {
    this.hitPulse = 1;
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeVisual(this.mesh);
  }

  private isOnPlatform(platforms: readonly GroundSurface[]): boolean {
    let touching = false;
    platforms.forEach((platform) => {
      this.physics.world.contactPair(this.collider, platform.collider, (manifold, flipped) => {
        const normalYFromMarble = manifold.normal().y * (flipped ? -1 : 1);
        touching ||= manifold.numSolverContacts() > 0 && normalYFromMarble < -0.5;
      });
    });
    return touching;
  }

  private setPosition(position: Vec3Data): void {
    this.previousPosition.set(position.x, position.y, position.z);
    this.currentPosition.copy(this.previousPosition);
    this.mesh.position.copy(this.previousPosition);
  }

  private updateTrail(): void {
    const velocity = this.body.linvel();
    const speed = Math.abs(velocity.x);
    const direction = speed > 0.16 ? -Math.sign(velocity.x) : -1;
    const visible = THREE.MathUtils.smoothstep(speed, 0.5, 3.1);
    this.trail.forEach((point, index) => {
      const distance = 0.52 + index * 0.26 + visible * 0.18;
      point.position.set(direction * distance, -0.1 + index * 0.035, -0.16 - index * 0.018);
      point.scale.setScalar(0.75 + visible * 0.55);
      point.material.opacity = visible * (0.2 - index * 0.038);
    });
  }
}
