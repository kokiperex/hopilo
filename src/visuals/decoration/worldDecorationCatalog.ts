import type { LevelDefinition } from '../../levels/types';
import { beachDecoration } from './beachDecoration';
import { forestDecoration } from './forestDecoration';
import { spaceDecoration } from './spaceDecoration';
import type { DecorationPlacement } from './types';
import { woodDecoration } from './woodDecoration';

export function worldDecorationPlacements(level: LevelDefinition): readonly DecorationPlacement[] {
  const worldPlacements = level.world === 'beach'
    ? beachDecoration(level)
    : level.world === 'wood'
      ? woodDecoration(level)
      : level.world === 'space'
        ? spaceDecoration(level)
        : forestDecoration(level);
  const courseMarkers: DecorationPlacement[] = [
    {
      asset: 'minigolf-goal',
      position: { x: level.goal.position.x + 0.18, y: level.goal.position.y - 1.08, z: -0.58 },
      scale: 1.65,
      castShadow: true,
    },
    ...level.checkpoints.map((checkpoint) => ({
      asset: 'minigolf-flag' as const,
      position: { x: checkpoint.position.x + 0.08, y: checkpoint.position.y - 0.72, z: -0.48 },
      scale: 1.08,
      castShadow: true,
    })),
  ];
  return [...worldPlacements, ...courseMarkers];
}
