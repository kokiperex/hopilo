import * as THREE from 'three';
import type { LevelDefinition } from '../levels/types';
import { WORLD_META } from '../levels/worldMeta';

type Material = THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;

/** Builds a shallow, primitive-only backdrop behind the shared 2.5D gameplay plane. */
export function createWorldScene(scene: THREE.Scene, level: LevelDefinition): THREE.Group {
  const group = new THREE.Group();
  const theme = WORLD_META[level.world];
  group.name = `world-decoration-${level.world}-${level.sceneVariant}`;

  group.add(new THREE.HemisphereLight('#ffffff', level.world === 'space' ? '#11102f' : theme.color, 1.85));
  const keyLight = new THREE.DirectionalLight(level.world === 'space' ? '#d9dcff' : '#fff2d2', 1.85);
  keyLight.position.set(-8, 12, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(512, 512);
  keyLight.shadow.camera.left = -14;
  keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -7;
  keyLight.shadow.normalBias = 0.035;
  group.add(keyLight);

  const adventure = level.sceneVariant === 'adventure';
  const halfLength = level.approximateLength / 2;
  const sceneryStep = 55;
  const firstChunk = Math.floor((-halfLength - 30) / sceneryStep) * sceneryStep;
  for (let offset = firstChunk; offset <= halfLength + 30; offset += sceneryStep) {
    const chunk = new THREE.Group();
    chunk.position.x = offset;
    if (level.world === 'beach') addBeach(chunk, adventure);
    else if (level.world === 'wood') addWood(chunk, adventure);
    else if (level.world === 'space') addSpace(chunk, adventure);
    else addForest(chunk, adventure);
    group.add(chunk);
  }

  scene.add(group);
  return group;
}

function addBeach(group: THREE.Group, adventure: boolean): void {
  const water = standard('#129fca', 0.28, true, 0.78);
  const distantSand = standard('#efbb62', 0.92);
  const trunk = standard('#9c673d', 0.9);
  const leaf = standard(adventure ? '#218d71' : '#37a66f', 0.82);
  addMesh(group, new THREE.BoxGeometry(58, 1.2, 0.38), water, 7, -1.32, -2.5);
  const foam = basic('#d7faff', true, 0.5);
  [-13, -1, 11, 24, 36].forEach((x, index) => {
    const wave = addMesh(group, new THREE.BoxGeometry(4.4, 0.055, 0.04), foam, x, -0.77 + (index % 2) * 0.16, -2.27);
    wave.rotation.z = index % 2 ? -0.03 : 0.025;
  });

  const duneGeometry = new THREE.SphereGeometry(1, 12, 8);
  [-16, -5, 8, 22, 33].forEach((x, index) => {
    const dune = addMesh(group, duneGeometry, distantSand, x, -0.95 + (index % 2) * 0.16, -4.4);
    dune.scale.set(4.2, 0.75, 1.2);
  });

  const cloudMaterial = basic('#ffffff', true, 0.66);
  [-12, 2, 17, 30].forEach((x, index) => addCloud(group, x, 4.25 + (index % 2) * 0.65, cloudMaterial));
  const palmXs = adventure ? [-10, 7, 25] : [-14, 13, 29];
  palmXs.forEach((x, index) => {
    const palm = new THREE.Group();
    const stem = addMesh(palm, new THREE.CylinderGeometry(0.13, 0.2, 2.3, 7), trunk, 0, 0, 0);
    stem.rotation.z = index % 2 === 0 ? -0.12 : 0.1;
    for (let leafIndex = 0; leafIndex < 5; leafIndex += 1) {
      const frond = addMesh(palm, new THREE.ConeGeometry(0.33, 1.4, 5), leaf, 0, 1.15, 0);
      frond.rotation.z = (leafIndex / 5) * Math.PI * 2;
    }
    palm.position.set(x, 0.25, -4);
    group.add(palm);
  });

  if (adventure) {
    const coral = standard('#ef806f', 0.74);
    [-1, 14].forEach((x) => {
      const marker = addMesh(group, new THREE.ConeGeometry(0.42, 0.9, 6), coral, x, -0.2, -3.35);
      marker.rotation.z = 0.18;
    });
    const shell = standard('#fff0cc', 0.64);
    [5, 27].forEach((x, index) => {
      const pebble = addMesh(group, new THREE.DodecahedronGeometry(0.24, 0), shell, x, -0.32 + index * 0.16, -3.15);
      pebble.scale.set(1.35, 0.65, 0.55);
    });
  }
}

function addWood(group: THREE.Group, adventure: boolean): void {
  const bench = standard('#b96f42', 0.9);
  const maple = standard('#e0aa68', 0.84);
  const blue = standard('#5f9fc1', 0.75);
  const red = standard('#d86d58', 0.75);
  addMesh(group, new THREE.BoxGeometry(60, 1.7, 0.5), bench, 7, -1.65, -3.7);
  addMesh(group, new THREE.BoxGeometry(60, 0.22, 0.42), maple, 7, 4.85, -5);
  const seam = standard('#8b4f35', 0.92);
  [-17, -9, -1, 7, 15, 23, 31].forEach((x) => addMesh(group, new THREE.BoxGeometry(0.12, 1.82, 0.03), seam, x, -1.64, -3.43));

  const blockGeometry = new THREE.BoxGeometry(1.25, 1.25, 1.25);
  [-15, -6, 4, 14, 25, 33].forEach((x, index) => {
    const material = index % 3 === 0 ? red : index % 2 === 0 ? blue : maple;
    const block = addMesh(group, blockGeometry, material, x, -0.3 + (index % 2) * 0.45, -4.2);
    block.rotation.z = (index % 2 ? 1 : -1) * 0.12;
  });

  const wheelGeometry = new THREE.CylinderGeometry(0.68, 0.68, 0.32, 12);
  const wheelXs = adventure ? [-10, 1, 18, 30] : [-11, 9, 27];
  wheelXs.forEach((x, index) => {
    const wheel = addMesh(group, wheelGeometry, index % 2 ? red : blue, x, 2.6 + (index % 2) * 0.7, -4.7);
    wheel.rotation.x = Math.PI / 2;
    addMesh(group, new THREE.CylinderGeometry(0.17, 0.17, 0.42, 10), maple, x, wheel.position.y, -4.45).rotation.x = Math.PI / 2;
  });

  if (adventure) {
    const arch = new THREE.TorusGeometry(1.25, 0.28, 7, 14, Math.PI);
    [-3, 22].forEach((x) => addMesh(group, arch, maple, x, 0.2, -4.35));
    const peg = standard('#fff1c2', 0.42);
    [2, 14, 29].forEach((x) => {
      const circle = addMesh(group, new THREE.CylinderGeometry(0.16, 0.16, 0.06, 8), peg, x, 0.85, -3.38);
      circle.rotation.x = Math.PI / 2;
    });
  }
}

function addSpace(group: THREE.Group, adventure: boolean): void {
  const starMaterial = new THREE.PointsMaterial({ color: '#ffffff', size: 0.1, transparent: true, opacity: 0.88 });
  const positions: number[] = [];
  for (let index = 0; index < 64; index += 1) {
    positions.push(((index * 17) % 57) - 20, ((index * 11) % 11) - 1, -6 - (index % 3));
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  group.add(new THREE.Points(starGeometry, starMaterial));

  const planetGeometry = new THREE.IcosahedronGeometry(1, 2);
  const lavender = standard('#918ee6', 0.7);
  const coral = standard('#e87992', 0.68);
  const ice = standard('#bcd9ee', 0.68);
  const planetXs = adventure ? [-13, 1, 18, 32] : [-15, 8, 27];
  planetXs.forEach((x, index) => {
    const radius = 0.8 + (index % 2) * 0.55;
    const planet = addMesh(group, planetGeometry, index % 3 === 0 ? coral : index % 2 === 0 ? ice : lavender, x, 3.2 + (index % 2) * 0.75, -5.2);
    planet.scale.setScalar(radius);
    if ((index + Number(adventure)) % 2 === 0) {
      const ring = addMesh(group, new THREE.TorusGeometry(radius * 1.35, 0.08, 6, 18), ice, x, planet.position.y, -5.1);
      ring.rotation.x = 1.2;
      ring.rotation.z = 0.25;
    }
  });

  const glow = basic(adventure ? '#7168d8' : '#514aa0', true, 0.16);
  const nebula = addMesh(group, new THREE.SphereGeometry(1, 12, 8), glow, 9, 1.5, -8);
  nebula.scale.set(11, 4.5, 1);
  const orbit = standard('#c9d9ff', 0.46, true, 0.36);
  [0, 19].forEach((x, index) => {
    const ring = addMesh(group, new THREE.TorusGeometry(1.2 + index * 0.28, 0.035, 5, 16), orbit, x, 1.3 + index * 0.8, -5.7);
    ring.rotation.x = 1.12;
    ring.rotation.z = -0.22;
  });
}

function addForest(group: THREE.Group, adventure: boolean): void {
  const hill = standard('#6fa65a', 0.92);
  const darkLeaf = standard(adventure ? '#2f7949' : '#418f50', 0.88);
  const lightLeaf = standard('#78ad55', 0.86);
  const bark = standard('#73513a', 0.94);
  const rock = standard('#7f8b86', 0.95);

  const hillGeometry = new THREE.SphereGeometry(1, 12, 8);
  [-17, -5, 8, 21, 34].forEach((x, index) => {
    const mound = addMesh(group, hillGeometry, hill, x, -0.65 + (index % 2) * 0.25, -5.2);
    mound.scale.set(5, 1.4, 1.4);
  });

  const treeXs = adventure ? [-14, -7, 7, 16, 27, 34] : [-15, -3, 10, 23, 33];
  treeXs.forEach((x, index) => {
    addMesh(group, new THREE.CylinderGeometry(0.24, 0.34, 2.65, 7), bark, x, 0.65, -4.25);
    const crown = addMesh(group, new THREE.IcosahedronGeometry(1, 1), index % 2 ? lightLeaf : darkLeaf, x, 2.25, -4.2);
    crown.scale.set(1.25, 1.05, 0.8);
    const crownTop = addMesh(group, new THREE.IcosahedronGeometry(0.72, 1), darkLeaf, x + 0.55, 2.8, -4.25);
    crownTop.scale.set(1.1, 0.9, 0.8);
  });

  const rockGeometry = new THREE.DodecahedronGeometry(0.55, 0);
  [-10, 2, 13, 29].forEach((x, index) => {
    const stone = addMesh(group, rockGeometry, rock, x, -0.25, -3.4);
    stone.scale.set(1.3, 0.72 + (index % 2) * 0.22, 0.9);
  });

  const flower = standard('#f0ca6b', 0.72);
  [-6, 6, 20].forEach((x, index) => {
    const bloom = addMesh(group, new THREE.ConeGeometry(0.18, 0.42, 5), flower, x, -0.18 + (index % 2) * 0.16, -3.25);
    bloom.rotation.z = 0.18;
  });
}

function addCloud(group: THREE.Group, x: number, y: number, material: THREE.MeshBasicMaterial): void {
  const cloud = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.62, 10, 7);
  [0, 0.72, 1.38].forEach((offset, index) => {
    const puff = addMesh(cloud, geometry, material, offset, index === 1 ? 0.22 : 0, 0);
    puff.scale.set(1 + index * 0.08, 0.78, 0.72);
  });
  cloud.position.set(x, y, -5.3);
  group.add(cloud);
}

function addMesh(
  parent: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: Material,
  x: number,
  y: number,
  z: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  // Background never contributes to the shadow pass: it stays soft and cheap.
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

function standard(color: string, roughness: number, transparent = false, opacity = 1): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, transparent, opacity, flatShading: true });
}

function basic(color: string, transparent = false, opacity = 1): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, transparent, opacity });
}

export function disposeWorldScene(group: THREE.Group): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  group.removeFromParent();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
      geometries.add(object.geometry);
      if (Array.isArray(object.material)) object.material.forEach((material) => materials.add(material));
      else materials.add(object.material);
    }
    if (object instanceof THREE.DirectionalLight) object.shadow.map?.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
