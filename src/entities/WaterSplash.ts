import * as THREE from 'three';
import { disposeObject } from './LevelItems';

interface Droplet {
  readonly mesh: THREE.Mesh<THREE.OctahedronGeometry, THREE.MeshBasicMaterial>;
  readonly direction: number;
  readonly lift: number;
}

/** A brief, low-poly water impact shown when the marble falls into a beach hazard. */
export class WaterSplash {
  public readonly mesh = new THREE.Group();
  private readonly ringMaterial = new THREE.MeshBasicMaterial({ color: '#d8fbff', transparent: true, opacity: 0.9 });
  private readonly droplets: Droplet[] = [];
  private elapsedSeconds = 0;

  public constructor(position: THREE.Vector3) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.055, 5, 12), this.ringMaterial);
    ring.scale.y = 0.42;
    this.mesh.add(ring);

    [-1, -0.7, -0.35, 0.35, 0.7, 1].forEach((direction, index) => {
      const material = new THREE.MeshBasicMaterial({ color: index % 2 === 0 ? '#e6fdff' : '#78ddf1', transparent: true, opacity: 0.9 });
      const droplet = new THREE.Mesh(new THREE.OctahedronGeometry(0.11 + (index % 2) * 0.025, 0), material);
      this.droplets.push({ mesh: droplet, direction, lift: 0.72 + (index % 3) * 0.16 });
      this.mesh.add(droplet);
    });

    this.mesh.position.copy(position);
  }

  public update(deltaSeconds: number): void {
    this.elapsedSeconds += deltaSeconds;
    const progress = Math.min(1, this.elapsedSeconds / 0.52);
    const ring = this.mesh.children[0] as THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
    const ringScale = 1 + progress * 2.4;
    ring.scale.set(ringScale, ringScale * 0.42, ringScale);
    this.ringMaterial.opacity = (1 - progress) * 0.9;

    this.droplets.forEach(({ mesh, direction, lift }, index) => {
      const arc = lift * progress - 0.72 * progress * progress;
      mesh.position.set(direction * (0.16 + progress * (0.62 + index * 0.025)), arc, -0.04 - (index % 2) * 0.04);
      const scale = Math.max(0.28, 1 - progress * 0.62);
      mesh.scale.setScalar(scale);
      mesh.material.opacity = (1 - progress) * 0.9;
    });
  }

  public get finished(): boolean {
    return this.elapsedSeconds >= 0.52;
  }

  public dispose(): void {
    disposeObject(this.mesh);
  }
}
