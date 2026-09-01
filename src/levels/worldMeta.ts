import type { WorldId } from './types';

export interface WorldMeta {
  id: WorldId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  surfaceColor: string;
  surfaceAccent: string;
  sceneColor: string;
  backdropColor: string;
}

export const WORLD_META: Record<WorldId, WorldMeta> = {
  beach: {
    id: 'beach', name: 'Mundo Playa', shortName: 'Playa', description: 'Arena, olas y balsas',
    color: '#0b9ec5', surfaceColor: '#f6ce70', surfaceAccent: '#eea85f', sceneColor: '#8ed8ff', backdropColor: '#dff5ff',
  },
  wood: {
    id: 'wood', name: 'Mundo Madera', shortName: 'Madera', description: 'Puentes de juguete',
    color: '#bd713d', surfaceColor: '#dca15c', surfaceAccent: '#9e5934', sceneColor: '#f7d8a5', backdropColor: '#fff0d2',
  },
  space: {
    id: 'space', name: 'Mundo Espacio', shortName: 'Espacio', description: 'Saltos entre planetas',
    color: '#5f5add', surfaceColor: '#9391e8', surfaceAccent: '#5f5add', sceneColor: '#28245c', backdropColor: '#17163f',
  },
  forest: {
    id: 'forest', name: 'Mundo Bosque', shortName: 'Bosque', description: 'Troncos y hojas suaves',
    color: '#378c55', surfaceColor: '#8ebc59', surfaceAccent: '#75523b', sceneColor: '#a7d790', backdropColor: '#d9efbb',
  },
};

export const WORLD_ORDER: readonly WorldId[] = ['beach', 'wood', 'space', 'forest'];
