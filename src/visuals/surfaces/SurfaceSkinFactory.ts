import * as THREE from 'three';
import type { WorldId } from '../../levels/types';

interface SurfacePalette {
  readonly top: string;
  readonly side: string;
  readonly trim: string;
  readonly detail: string;
  readonly roughness: number;
  readonly metalness: number;
  readonly emissive?: string;
}

const PALETTES: Record<WorldId, SurfacePalette> = {
  beach: { top: '#f6ce70', side: '#d99b50', trim: '#3cc5ca', detail: '#fff0b8', roughness: 0.92, metalness: 0 },
  wood: { top: '#d99a5f', side: '#9e5f3a', trim: '#f1c17c', detail: '#7b4933', roughness: 0.82, metalness: 0 },
  space: { top: '#dae9f4', side: '#6577a3', trim: '#7f74ea', detail: '#b8f3ff', roughness: 0.38, metalness: 0.22, emissive: '#4769a8' },
  forest: { top: '#8ebc59', side: '#644633', trim: '#927052', detail: '#c2df78', roughness: 0.96, metalness: 0 },
};

/** Per-level factory: meshes share unit geometry and materials, then the whole pool is released together. */
export class SurfaceSkinFactory {
  private readonly unitBox = new THREE.BoxGeometry(1, 1, 1);
  private readonly unitCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
  private readonly materials = new Map<string, THREE.MeshStandardMaterial>();

  public constructor(private readonly world: WorldId) {}

  public create(size: { x: number; y: number; z: number }, sourceColor: string): THREE.Group {
    const palette = PALETTES[this.world];
    const group = new THREE.Group();
    group.name = `surface-skin-${this.world}`;
    const baseColor = mixHex(palette.side, sourceColor, 0.2);
    const topColor = mixHex(palette.top, sourceColor, 0.18);

    const base = this.box(size.x, size.y, size.z, this.material(baseColor, 'base', palette));
    const capHeight = Math.min(0.13, Math.max(0.065, size.y * 0.15));
    const cap = this.box(size.x * 0.985, capHeight, size.z * 0.97, this.material(topColor, 'top', palette));
    cap.position.y = size.y / 2 + capHeight / 2 - 0.018;
    group.add(base, cap);

    if (this.world === 'beach') this.addBeachDetails(group, size, palette, capHeight);
    else if (this.world === 'wood') this.addWoodDetails(group, size, palette, capHeight);
    else if (this.world === 'space') this.addSpaceDetails(group, size, palette, capHeight);
    else this.addForestDetails(group, size, palette, capHeight);

    group.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });
    return group;
  }

  public dispose(): void {
    this.unitBox.dispose();
    this.unitCylinder.dispose();
    this.materials.forEach((material) => material.dispose());
    this.materials.clear();
  }

  private addBeachDetails(group: THREE.Group, size: { x: number; y: number; z: number }, palette: SurfacePalette, capHeight: number): void {
    const trim = this.material(palette.trim, 'trim', palette);
    [-1, 1].forEach((side) => {
      const rail = this.box(size.x * 0.99, 0.055, 0.07, trim);
      rail.position.set(0, size.y / 2 + capHeight + 0.008, side * (size.z / 2 - 0.055));
      group.add(rail);
    });
    if (size.x > 2.2) {
      const board = this.material(palette.detail, 'detail', palette);
      [-0.22, 0.22].forEach((offset) => {
        const seam = this.box(0.055, 0.024, size.z * 0.76, board);
        seam.position.set(offset * size.x, size.y / 2 + capHeight + 0.012, 0);
        group.add(seam);
      });
    }
  }

  private addWoodDetails(group: THREE.Group, size: { x: number; y: number; z: number }, palette: SurfacePalette, capHeight: number): void {
    const seamMaterial = this.material(palette.detail, 'detail', palette);
    const seamCount = Math.min(5, Math.max(2, Math.floor(size.x / 1.55)));
    for (let index = 1; index < seamCount; index += 1) {
      const seam = this.box(0.035, 0.026, size.z * 0.9, seamMaterial);
      seam.position.set(-size.x / 2 + (index * size.x) / seamCount, size.y / 2 + capHeight + 0.013, 0);
      group.add(seam);
    }
    const trim = this.material(palette.trim, 'trim', palette);
    [-1, 1].forEach((side) => {
      const slat = this.box(size.x * 0.96, 0.045, 0.065, trim);
      slat.position.set(0, size.y / 2 + capHeight + 0.012, side * (size.z / 2 - 0.08));
      group.add(slat);
    });
  }

  private addSpaceDetails(group: THREE.Group, size: { x: number; y: number; z: number }, palette: SurfacePalette, capHeight: number): void {
    const trim = this.material(palette.trim, 'trim', palette, palette.emissive, 0.28);
    [-1, 1].forEach((side) => {
      const joint = this.box(size.x * 0.9, 0.045, 0.075, trim);
      joint.position.set(0, size.y / 2 + capHeight + 0.016, side * (size.z / 2 - 0.12));
      group.add(joint);
    });
    const panel = this.material(palette.detail, 'detail', palette, palette.emissive, 0.2);
    const divider = this.box(0.045, 0.035, size.z * 0.7, panel);
    divider.position.y = size.y / 2 + capHeight + 0.018;
    group.add(divider);
  }

  private addForestDetails(group: THREE.Group, size: { x: number; y: number; z: number }, palette: SurfacePalette, capHeight: number): void {
    const bark = this.material(palette.trim, 'trim', palette);
    [-1, 1].forEach((side) => {
      const root = this.box(size.x * 0.98, 0.1, 0.1, bark);
      root.position.set(0, size.y / 2 + capHeight * 0.45, side * (size.z / 2 - 0.06));
      group.add(root);
    });
    if (size.x > 2.6) {
      const grass = this.material(palette.detail, 'detail', palette);
      [-0.27, 0.29].forEach((offset, index) => {
        const tuft = new THREE.Mesh(this.unitCylinder, grass);
        tuft.scale.set(0.09, 0.08 + index * 0.025, 0.09);
        tuft.position.set(offset * size.x, size.y / 2 + capHeight + 0.055, -size.z * 0.35);
        group.add(tuft);
      });
    }
  }

  private box(x: number, y: number, z: number, material: THREE.Material): THREE.Mesh {
    const mesh = new THREE.Mesh(this.unitBox, material);
    mesh.scale.set(x, y, z);
    return mesh;
  }

  private material(color: string, role: string, palette: SurfacePalette, emissive = '#000000', emissiveIntensity = 0): THREE.MeshStandardMaterial {
    const key = `${role}:${color}:${emissive}:${emissiveIntensity}`;
    let material = this.materials.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity,
        roughness: palette.roughness,
        metalness: palette.metalness,
        flatShading: true,
      });
      this.materials.set(key, material);
    }
    return material;
  }
}

function mixHex(base: string, authored: string, amount: number): string {
  return `#${new THREE.Color(base).lerp(new THREE.Color(authored), amount).getHexString()}`;
}
