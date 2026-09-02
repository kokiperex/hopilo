import * as THREE from 'three';
import type { MarbleSkinId } from './skinCatalog';

export interface MarbleSkinVisual {
  rollingVisual: THREE.Group;
  sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  trailColor: THREE.ColorRepresentation;
}

interface SkinMaterialStyle {
  color: THREE.ColorRepresentation;
  roughness: number;
  metalness: number;
  transmission?: number;
  opacity?: number;
  clearcoat?: number;
  texture?: THREE.CanvasTexture;
  trailColor: THREE.ColorRepresentation;
}

/** Creates a visual skin without changing the shared spherical collider. */
export function createMarbleSkin(skinId: MarbleSkinId, radius: number): MarbleSkinVisual {
  const style = createMaterialStyle(skinId);
  const material = new THREE.MeshPhysicalMaterial({
    color: style.color,
    roughness: style.roughness,
    metalness: style.metalness,
    transmission: style.transmission ?? 0,
    ...(style.texture ? { map: style.texture } : {}),
    clearcoat: style.clearcoat ?? 0.72,
    clearcoatRoughness: 0.12,
    transparent: (style.opacity ?? 1) < 1,
    opacity: style.opacity ?? 1,
  });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), material);
  sphere.castShadow = true;

  const rollingVisual = new THREE.Group();
  rollingVisual.add(sphere);
  if (skinId === 'tire') addTireDetails(rollingVisual, radius);
  else addGlassHighlight(sphere, radius, skinId === 'blue-glass' ? '#d5f6ff' : '#ffffff');

  return { rollingVisual, sphere, trailColor: style.trailColor };
}

function createMaterialStyle(skinId: MarbleSkinId): SkinMaterialStyle {
  switch (skinId) {
    case 'tire':
      return { color: '#343b40', roughness: 0.72, metalness: 0.02, clearcoat: 0.16, trailColor: '#8e99a3' };
    case 'ribbons':
      return { color: '#ffffff', roughness: 0.13, metalness: 0.04, transmission: 0.12, opacity: 0.96, texture: createSkinTexture('ribbons'), trailColor: '#ffd95c' };
    case 'ember':
      return { color: '#ffffff', roughness: 0.22, metalness: 0.04, texture: createSkinTexture('ember'), trailColor: '#ff806d' };
    case 'turkiye':
      return { color: '#ffffff', roughness: 0.2, metalness: 0.03, texture: createSkinTexture('turkiye'), trailColor: '#ff8c8c' };
    case 'peru':
      return { color: '#ffffff', roughness: 0.2, metalness: 0.03, texture: createSkinTexture('peru'), trailColor: '#ff9c95' };
    case 'prism-x':
      return { color: '#ffffff', roughness: 0.18, metalness: 0.03, texture: createSkinTexture('prism-x'), trailColor: '#77d89c' };
    default:
      return { color: '#59b9ff', roughness: 0.12, metalness: 0.1, transmission: 0.08, opacity: 0.95, trailColor: '#7ee7ff' };
  }
}

function createSkinTexture(skinId: Exclude<MarbleSkinId, 'blue-glass' | 'tire'>): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('A 2D canvas is required to create marble skins.');

  if (skinId === 'ribbons') drawRibbons(context, canvas.width, canvas.height);
  else if (skinId === 'ember') drawEmber(context, canvas.width, canvas.height);
  else if (skinId === 'turkiye') drawTurkiye(context, canvas.width, canvas.height);
  else if (skinId === 'peru') drawPeru(context, canvas.width, canvas.height);
  else drawPrismX(context, canvas.width, canvas.height);
  drawFriendlyFace(context, 128, 132);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return texture;
}

function drawRibbons(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#dff7ff';
  context.fillRect(0, 0, width, height);
  const colors = ['#2675d8', '#f6c83f', '#ef5c53', '#ee922e'];
  colors.forEach((color, index) => {
    context.beginPath();
    context.moveTo(-30, 40 + index * 42);
    context.bezierCurveTo(100, 190 - index * 20, 260, -20 + index * 38, width + 35, 80 + index * 28);
    context.strokeStyle = color;
    context.lineWidth = 26;
    context.lineCap = 'round';
    context.stroke();
  });
}

function drawEmber(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#a43f31';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#522d2a';
  context.beginPath();
  context.moveTo(0, 30);
  context.bezierCurveTo(110, 5, 150, 125, 260, 82);
  context.bezierCurveTo(365, 38, 410, 150, width, 120);
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();
  context.strokeStyle = '#db6853';
  context.lineWidth = 12;
  context.beginPath();
  context.moveTo(0, 34);
  context.bezierCurveTo(110, 8, 150, 128, 260, 85);
  context.bezierCurveTo(365, 41, 410, 153, width, 123);
  context.stroke();
}

function drawTurkiye(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#df2d36';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#ffffff';
  context.beginPath();
  context.arc(95, 93, 48, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#df2d36';
  context.beginPath();
  context.arc(111, 84, 39, 0, Math.PI * 2);
  context.fill();
  drawStar(context, 164, 92, 23, 10, '#ffffff');
}

function drawPeru(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#d82d3d';
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#fffaf0';
  context.fillRect(58, 0, 140, height);
  context.fillRect(314, 0, 140, height);
}

function drawPrismX(context: CanvasRenderingContext2D, width: number, height: number): void {
  context.fillStyle = '#f8f3e8';
  context.fillRect(0, 0, width, height);
  const bands: Array<[string, number, number, number, number]> = [
    ['#55a95a', 20, 20, 230, 225],
    ['#f3ca39', 235, 20, 20, 225],
    ['#ed8a32', 276, 20, 491, 225],
    ['#d94a46', 491, 20, 276, 225],
  ];
  bands.forEach(([color, fromX, fromY, toX, toY]) => {
    context.strokeStyle = color;
    context.lineWidth = 38;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();
  });
  context.fillStyle = '#2d6fc5';
  context.beginPath();
  context.arc(256, 128, 19, 0, Math.PI * 2);
  context.fill();
}

function drawFriendlyFace(context: CanvasRenderingContext2D, centerX: number, centerY: number): void {
  context.fillStyle = '#17212a';
  context.beginPath();
  context.ellipse(centerX - 22, centerY - 15, 6, 12, 0, 0, Math.PI * 2);
  context.ellipse(centerX + 22, centerY - 15, 6, 12, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(centerX, centerY + 2, 34, 0.18 * Math.PI, 0.82 * Math.PI);
  context.strokeStyle = '#17212a';
  context.lineWidth = 7;
  context.lineCap = 'round';
  context.stroke();
}

function drawStar(context: CanvasRenderingContext2D, centerX: number, centerY: number, outerRadius: number, innerRadius: number, color: string): void {
  context.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * Math.PI / 5;
    const radius = point % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function addGlassHighlight(sphere: THREE.Mesh, radius: number, color: THREE.ColorRepresentation): void {
  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.32, 10, 7),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, depthWrite: false }),
  );
  highlight.position.set(-radius * 0.42, radius * 0.33, radius * 0.42);
  sphere.add(highlight);
}

function addTireDetails(group: THREE.Group, radius: number): void {
  const treadMaterial = new THREE.MeshStandardMaterial({ color: '#171a1d', roughness: 0.85 });
  const bumpGeometry = new THREE.SphereGeometry(radius * 0.13, 8, 6);
  for (let index = 0; index < 14; index += 1) {
    const angle = (index / 14) * Math.PI * 2;
    const bump = new THREE.Mesh(bumpGeometry, treadMaterial);
    bump.position.set(Math.cos(angle) * radius * 1.04, Math.sin(angle) * radius * 1.04, 0);
    bump.rotation.z = angle;
    bump.scale.set(1.45, 0.82, 0.88);
    bump.castShadow = true;
    group.add(bump);
  }
  const treadGeometry = new THREE.BoxGeometry(radius * 0.32, radius * 0.1, radius * 0.08);
  for (let index = 0; index < 10; index += 1) {
    const angle = (index / 10) * Math.PI * 2;
    const tread = new THREE.Mesh(treadGeometry, treadMaterial);
    tread.position.set(Math.cos(angle) * radius * 0.91, Math.sin(angle) * radius * 0.91, radius * 0.82);
    tread.rotation.z = angle + Math.PI / 2;
    group.add(tread);
  }
  addFriendlyFaceMeshes(group, radius);
}

function addFriendlyFaceMeshes(group: THREE.Group, radius: number): void {
  const faceMaterial = new THREE.MeshBasicMaterial({ color: '#b9c4c9' });
  const eyeGeometry = new THREE.SphereGeometry(radius * 0.065, 8, 6);
  [-1, 1].forEach((direction) => {
    const eye = new THREE.Mesh(eyeGeometry, faceMaterial);
    eye.position.set(direction * radius * 0.2, radius * 0.13, radius * 0.96);
    eye.scale.set(0.72, 1.55, 0.45);
    group.add(eye);
  });
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.22, radius * 0.035, 6, 18, Math.PI),
    faceMaterial,
  );
  smile.position.set(0, radius * 0.02, radius * 0.97);
  smile.rotation.z = Math.PI;
  group.add(smile);
}
