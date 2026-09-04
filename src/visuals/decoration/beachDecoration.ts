import type { LevelDefinition } from '../../levels/types';
import { sceneryOffsets, type DecorationPlacement } from './types';

export function beachDecoration(level: LevelDefinition): readonly DecorationPlacement[] {
  return sceneryOffsets(level.approximateLength).flatMap((offset, index) => [
    { asset: 'minigolf-tunnel', position: { x: offset + 15, y: -0.72, z: -4.15 }, scale: 3.4, tint: '#4dc7c8' },
    index % 2 === 0
      ? { asset: 'minigolf-marker', position: { x: offset - 9, y: -0.38, z: -3.35 }, scale: 1.3, rotationY: -0.18, tint: '#ef826d' }
      : { asset: 'minigolf-ramp', position: { x: offset - 9, y: -0.72, z: -3.75 }, scale: 2.25, rotationY: 0.1, tint: '#f2bd62' },
  ] satisfies DecorationPlacement[]);
}
