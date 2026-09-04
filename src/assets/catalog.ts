import type { VisualAssetDefinition } from './types';

const MINIGOLF_SOURCE = 'https://kenney.nl/assets/minigolf-kit';
const FOREST_SOURCE = 'https://kenney.nl/assets/mini-forest';
const PARTICLE_SOURCE = 'https://kenney.nl/assets/particle-pack';
const UI_SOURCE = 'https://kenney.nl/assets/ui-pack';

export const MODEL_ASSETS = {
  'minigolf-flag': model('assets/kenney/minigolf/flag-blue.glb', MINIGOLF_SOURCE, 'Checkpoint de circuito.'),
  'minigolf-goal': model('assets/kenney/minigolf/flag-large-blue.glb', MINIGOLF_SOURCE, 'Meta de circuito.'),
  'minigolf-tunnel': model('assets/kenney/minigolf/tunnel-wide.glb', MINIGOLF_SOURCE, 'Arco de recorrido en segundo plano.'),
  'minigolf-barrier': model('assets/kenney/minigolf/obstacle-block.glb', MINIGOLF_SOURCE, 'Barrera decorativa.'),
  'minigolf-marker': model('assets/kenney/minigolf/obstacle-diamond.glb', MINIGOLF_SOURCE, 'Marcador decorativo de recorrido.'),
  'minigolf-surface': model('assets/kenney/minigolf/straight.glb', MINIGOLF_SOURCE, 'Chapa visual modular de plataforma.'),
  'minigolf-walkway': model('assets/kenney/minigolf/narrow-block.glb', MINIGOLF_SOURCE, 'Módulo visual de pasarela.'),
  'minigolf-ramp': model('assets/kenney/minigolf/ramp-low.glb', MINIGOLF_SOURCE, 'Rampa decorativa de fondo.'),
  'forest-tree': model('assets/kenney/mini-forest/tree.glb', FOREST_SOURCE, 'Árbol de fondo exclusivo del bosque.'),
  'forest-rocks': model('assets/kenney/mini-forest/rocks-low.glb', FOREST_SOURCE, 'Rocas de fondo exclusivas del bosque.'),
  'forest-plant': model('assets/kenney/mini-forest/plant.glb', FOREST_SOURCE, 'Planta de fondo exclusiva del bosque.'),
  'forest-stones': model('assets/kenney/mini-forest/stones.glb', FOREST_SOURCE, 'Piedras de fondo exclusivas del bosque.'),
} as const satisfies Record<string, VisualAssetDefinition>;

export const VFX_ASSETS = {
  'gem-spark': texture('assets/kenney/vfx/gem-spark.png', PARTICLE_SOURCE, 'Brillo al recoger una gema.'),
  'landing-dust': texture('assets/kenney/vfx/landing-dust.png', PARTICLE_SOURCE, 'Polvo breve al aterrizar.'),
  'water-foam': texture('assets/kenney/vfx/water-foam.png', PARTICLE_SOURCE, 'Espuma al entrar al agua.'),
  'fan-air': texture('assets/kenney/vfx/fan-air.png', PARTICLE_SOURCE, 'Corriente visible del ventilador.'),
  'goal-star': texture('assets/kenney/vfx/goal-star.png', PARTICLE_SOURCE, 'Estrellas de celebración de meta.'),
} as const satisfies Record<string, VisualAssetDefinition>;

export const UI_ASSETS = {
  'panel-border': ui('assets/kenney/ui/panel-border.png', UI_SOURCE, 'Marco de pausa, diálogo y tarjeta de nivel.'),
  'pause-tile': ui('assets/kenney/ui/pause-tile.png', UI_SOURCE, 'Base visual del botón de pausa.'),
  'star-filled': ui('assets/kenney/ui/star-filled.png', UI_SOURCE, 'Estrella conseguida.'),
  'star-outline': ui('assets/kenney/ui/star-outline.png', UI_SOURCE, 'Estrella aún no conseguida.'),
} as const satisfies Record<string, VisualAssetDefinition>;

export type ModelAssetId = keyof typeof MODEL_ASSETS;
export type VfxAssetId = keyof typeof VFX_ASSETS;
export type UiAssetId = keyof typeof UI_ASSETS;

export function assetUrl(definition: VisualAssetDefinition): string {
  return `${import.meta.env.BASE_URL}${definition.path}`;
}

export function uiAssetUrl(id: UiAssetId): string {
  return assetUrl(UI_ASSETS[id]);
}

function model(path: string, sourceUrl: string, purpose: string): VisualAssetDefinition {
  return { kind: 'model', path, sourceUrl, purpose };
}

function texture(path: string, sourceUrl: string, purpose: string): VisualAssetDefinition {
  return { kind: 'texture', path, sourceUrl, purpose };
}

function ui(path: string, sourceUrl: string, purpose: string): VisualAssetDefinition {
  return { kind: 'ui', path, sourceUrl, purpose };
}
