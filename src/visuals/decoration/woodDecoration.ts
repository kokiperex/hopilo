import type { LevelDefinition } from '../../levels/types';
import { sceneryOffsets, type DecorationPlacement } from './types';

export function woodDecoration(level: LevelDefinition): readonly DecorationPlacement[] {
  return sceneryOffsets(level.approximateLength).flatMap((offset, index) => [
    { asset: 'minigolf-barrier', position: { x: offset + 14, y: -0.55, z: -4.1 }, scale: 2.5, rotationY: index % 2 ? 0.18 : -0.16, tint: '#c67745' },
    { asset: 'minigolf-walkway', position: { x: offset - 11, y: -0.58, z: -3.65 }, scale: 2.15, rotationZ: index % 2 ? 0.08 : -0.08, tint: '#e2a666' },
  ] satisfies DecorationPlacement[]);
}
