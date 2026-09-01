import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { CheckpointDefinition, GemDefinition, GoalDefinition, HazardDefinition } from '../levels/types';
import type { PhysicsWorld } from '../physics/PhysicsWorld';

interface SensorItem {
  readonly body: RAPIER.RigidBody;
  readonly collider: RAPIER.Collider;
}

export interface GemItem extends SensorItem {
  readonly definition: GemDefinition;
  readonly mesh: THREE.Group;
  collected: boolean;
}

export interface CheckpointItem extends SensorItem {
  readonly definition: CheckpointDefinition;
  readonly mesh: THREE.Group;
  active: boolean;
  glow: number;
  readonly flagMaterial: THREE.MeshStandardMaterial;
}

export interface HazardItem extends SensorItem {
  readonly definition: HazardDefinition;
  readonly mesh: THREE.Group;
}

export interface GoalItem extends SensorItem {
  readonly definition: GoalDefinition;
  readonly mesh: THREE.Group;
  celebration: number;
}

export function createGem(physics: PhysicsWorld, definition: GemDefinition): GemItem {
  const mesh = new THREE.Group();
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.38, 0),
    new THREE.MeshStandardMaterial({ color: '#38e5ae', emissive: '#127e5b', emissiveIntensity: 0.65, roughness: 0.24 }),
  );
  crystal.rotation.z = Math.PI / 4;
  mesh.add(crystal);
  mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
  const sensor = physics.createSensorBall(definition.position, definition.radius ?? 0.78);
  return { definition, mesh, collected: false, ...sensor };
}

export function createCheckpoint(physics: PhysicsWorld, definition: CheckpointDefinition): CheckpointItem {
  const mesh = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.09, 1.25, 10),
    new THREE.MeshStandardMaterial({ color: '#fff6d9', roughness: 0.5 }),
  );
  pole.position.y = 0.25;
  const flagMaterial = new THREE.MeshStandardMaterial({ color: '#87a9b7', emissive: '#42626f', emissiveIntensity: 0.2, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.42), flagMaterial);
  flag.position.set(0.39, 0.58, 0);
  mesh.add(pole, flag);
  mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
  const sensor = physics.createSensorBall(definition.position, definition.radius ?? 0.95);
  return { definition, mesh, active: false, glow: 0, flagMaterial, ...sensor };
}

export function createHazard(physics: PhysicsWorld, definition: HazardDefinition): HazardItem {
  const mesh = new THREE.Group();
  if (definition.kind === 'spikes') {
    const geometry = new THREE.ConeGeometry(0.24, Math.max(0.55, definition.size.y), 5);
    const material = new THREE.MeshStandardMaterial({ color: '#fff7df', emissive: '#bc8b46', emissiveIntensity: 0.28, roughness: 0.42 });
    const count = Math.max(1, Math.floor(definition.size.x / 0.52));
    for (let index = 0; index < count; index += 1) {
      const spike = new THREE.Mesh(geometry, material);
      spike.position.set(-definition.size.x / 2 + ((index + 0.5) * definition.size.x) / count, 0, 0);
      mesh.add(spike);
    }
  } else {
    const isWater = definition.kind === 'water';
    const material = new THREE.MeshStandardMaterial({
      color: isWater ? '#147fc0' : '#201d4c', emissive: isWater ? '#075680' : '#0d0b25',
      emissiveIntensity: isWater ? 0.42 : 0.25, roughness: 0.3, transparent: true, opacity: isWater ? 0.82 : 0.7,
    });
    const surface = new THREE.Mesh(new THREE.BoxGeometry(definition.size.x, definition.size.y, definition.size.z), material);
    mesh.add(surface);
  }
  mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
  const sensor = physics.createSensorBox(definition.position, definition.size);
  return { definition, mesh, ...sensor };
}

export function createGoal(physics: PhysicsWorld, definition: GoalDefinition): GoalItem {
  const mesh = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 1.85, 10),
    new THREE.MeshStandardMaterial({ color: '#fff9df', roughness: 0.45 }),
  );
  pole.position.y = 0.35;
  mesh.add(pole);
  const squareGeometry = new THREE.PlaneGeometry(0.32, 0.28);
  const colors = ['#ffffff', '#263858', '#263858', '#ffffff'];
  colors.forEach((color, index) => {
    const square = new THREE.Mesh(squareGeometry, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    square.position.set(0.24 + (index % 2) * 0.32, 0.83 - Math.floor(index / 2) * 0.28, 0);
    mesh.add(square);
  });
  mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
  const sensor = physics.createSensorBall(definition.position, definition.radius ?? 1.05);
  return { definition, mesh, celebration: 0, ...sensor };
}

export function disposeObject(object: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.removeFromParent();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    if (Array.isArray(child.material)) child.material.forEach((material) => materials.add(material));
    else materials.add(child.material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
