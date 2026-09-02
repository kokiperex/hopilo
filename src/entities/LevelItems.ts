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
  const halo = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.54, 0),
    new THREE.MeshBasicMaterial({ color: '#9dffe0', transparent: true, opacity: 0.16 }),
  );
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.4, 0),
    new THREE.MeshStandardMaterial({ color: '#42edb2', emissive: '#0c8a60', emissiveIntensity: 0.72, roughness: 0.22, flatShading: true }),
  );
  crystal.rotation.z = Math.PI / 4;
  halo.scale.set(1, 1.15, 0.75);
  mesh.add(halo, crystal);
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
  const marker = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.045, 6, 12),
    new THREE.MeshBasicMaterial({ color: '#ffdc6e', transparent: true, opacity: 0.72 }),
  );
  marker.position.y = 0.18;
  marker.rotation.x = Math.PI / 2;
  mesh.add(pole, flag, marker);
  mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
  const sensor = physics.createSensorBall(definition.position, definition.radius ?? 0.95);
  return { definition, mesh, active: false, glow: 0, flagMaterial, ...sensor };
}

export function createHazard(physics: PhysicsWorld, definition: HazardDefinition): HazardItem {
  const mesh = new THREE.Group();
  if (definition.kind === 'spikes') {
    const geometry = new THREE.ConeGeometry(0.24, Math.max(0.55, definition.size.y), 5);
    const material = new THREE.MeshStandardMaterial({ color: '#fff9de', emissive: '#c18a44', emissiveIntensity: 0.32, roughness: 0.42, flatShading: true });
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(definition.size.x, 0.13, definition.size.z * 0.92),
      new THREE.MeshStandardMaterial({ color: '#d9574f', roughness: 0.66, flatShading: true }),
    );
    base.position.y = -definition.size.y / 2 + 0.065;
    base.castShadow = base.receiveShadow = true;
    mesh.add(base);
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
    if (isWater) {
      const foamMaterial = new THREE.MeshBasicMaterial({ color: '#d7fbff', transparent: true, opacity: 0.66 });
      [-0.28, 0, 0.28].forEach((offset, index) => {
        const foam = new THREE.Mesh(new THREE.BoxGeometry(definition.size.x * (0.22 + (index % 2) * 0.08), 0.035, 0.05), foamMaterial);
        foam.position.set(offset * definition.size.x, definition.size.y / 2 + 0.025, -definition.size.z / 2 - 0.015);
        mesh.add(foam);
      });
    } else {
      const rimMaterial = new THREE.MeshBasicMaterial({ color: '#756ce8', transparent: true, opacity: 0.55 });
      [-1, 1].forEach((side) => {
        const rim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, definition.size.z), rimMaterial);
        rim.position.set(side * (definition.size.x / 2 - 0.04), definition.size.y / 2 + 0.035, 0);
        mesh.add(rim);
      });
    }
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
  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 10, 7),
    new THREE.MeshStandardMaterial({ color: '#ffd96b', emissive: '#b87816', emissiveIntensity: 0.32, roughness: 0.36 }),
  );
  finial.position.y = 1.31;
  mesh.add(finial);
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
