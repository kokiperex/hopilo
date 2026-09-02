import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { HammerDefinition } from '../levels/types';
import { PHYSICS_CONFIG } from '../physics/constants';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import { disposeObject } from './LevelItems';

/** Kinematic, slowly moving arm. The pivot stays visible so its timing is easy to read. */
export class Hammer {
  public readonly mesh = new THREE.Group();
  public readonly body: RAPIER.RigidBody;
  public readonly collider: RAPIER.Collider;
  private elapsedSeconds = 0;

  public constructor(private readonly physics: PhysicsWorld, private readonly definition: HammerDefinition) {
    const armMaterial = new THREE.MeshStandardMaterial({ color: definition.color ?? '#d86d58', roughness: 0.68 });
    const arm = new THREE.Mesh(new THREE.BoxGeometry(definition.length, definition.thickness * 0.48, definition.thickness * 0.7), armMaterial);
    arm.position.x = definition.length / 2;
    const head = new THREE.Mesh(new THREE.BoxGeometry(definition.thickness * 1.5, definition.thickness * 1.35, definition.thickness), new THREE.MeshStandardMaterial({ color: '#fff0a8', emissive: '#c56d39', emissiveIntensity: 0.25, roughness: 0.5 }));
    head.position.x = definition.length;
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(definition.thickness * 0.42, definition.thickness * 0.42, definition.thickness * 0.9, 10), new THREE.MeshStandardMaterial({ color: '#fff8d7', roughness: 0.42 }));
    pivot.rotation.x = Math.PI / 2;
    [arm, head, pivot].forEach((part) => { part.castShadow = true; part.receiveShadow = true; this.mesh.add(part); });
    this.mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    const angle = definition.startAngle ?? -Math.PI / 2;
    const center = this.centerAt(angle);
    ({ body: this.body, collider: this.collider } = physics.createKinematicBox(center, { x: definition.length, y: definition.thickness, z: definition.thickness }, angle));
    this.mesh.rotation.z = angle;
  }

  public beforePhysicsStep(): void {
    this.elapsedSeconds += PHYSICS_CONFIG.fixedTimeStep;
    const angle = this.angleAt(this.elapsedSeconds);
    const center = this.centerAt(angle);
    this.body.setNextKinematicTranslation(center);
    this.body.setNextKinematicRotation({ x: 0, y: 0, z: Math.sin(angle / 2), w: Math.cos(angle / 2) });
  }

  public syncVisual(): void {
    this.mesh.rotation.z = this.angleAt(this.elapsedSeconds);
  }

  public dispose(): void {
    this.physics.removeBody(this.body);
    disposeObject(this.mesh);
  }

  private angleAt(elapsedSeconds: number): number {
    const start = this.definition.startAngle ?? -Math.PI / 2;
    const cycle = elapsedSeconds * this.definition.cyclesPerSecond * Math.PI * 2;
    return this.definition.mode === 'spin'
      ? start + cycle
      : start + Math.sin(cycle) * (this.definition.swingAngle ?? Math.PI / 2.4);
  }

  private centerAt(angle: number): { x: number; y: number; z: number } {
    return {
      x: this.definition.position.x + Math.cos(angle) * this.definition.length / 2,
      y: this.definition.position.y + Math.sin(angle) * this.definition.length / 2,
      z: this.definition.position.z,
    };
  }
}
