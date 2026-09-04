import type { LevelDefinition } from '../../levels/types';
import { sceneryOffsets, type DecorationPlacement } from './types';

export function spaceDecoration(level: LevelDefinition): readonly DecorationPlacement[] {
  return sceneryOffsets(level.approximateLength).flatMap((offset, index) => [
    { asset: 'minigolf-tunnel', position: { x: offset + 14, y: -0.55, z: -4.5 }, scale: 3.1, rotationY: Math.PI, tint: '#7774db' },
    { asset: 'minigolf-marker', position: { x: offset - 10, y: 2.35 + (index % 2) * 0.55, z: -4.65 }, scale: 1.45, rotationY: index * 0.55, rotationZ: 0.32, tint: index % 2 ? '#c4f3ff' : '#a99bea' },
  ] satisfies DecorationPlacement[]);
}
