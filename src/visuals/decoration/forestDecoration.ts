import type { LevelDefinition } from '../../levels/types';
import { sceneryOffsets, type DecorationPlacement } from './types';

export function forestDecoration(level: LevelDefinition): readonly DecorationPlacement[] {
  return sceneryOffsets(level.approximateLength).flatMap((offset, index) => [
    { asset: 'forest-tree', position: { x: offset + 15, y: -0.72, z: -4.4 }, scale: 1.72 + (index % 2) * 0.2, rotationY: index % 2 ? 0.22 : -0.18 },
    index % 2 === 0
      ? { asset: 'forest-rocks', position: { x: offset - 10, y: -0.68, z: -3.55 }, scale: 1.25, rotationY: -0.2 }
      : { asset: 'forest-stones', position: { x: offset - 10, y: -0.67, z: -3.55 }, scale: 1.18, rotationY: 0.28 },
    { asset: 'forest-plant', position: { x: offset + 3, y: -0.63, z: -3.7 }, scale: 0.72, rotationY: index * 0.36 },
  ] satisfies DecorationPlacement[]);
}
