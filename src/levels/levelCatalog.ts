import { BEACH_LEVELS } from './worlds/beachLevels';
import { FOREST_LEVELS } from './worlds/forestLevels';
import { SPACE_LEVELS } from './worlds/spaceLevels';
import { WOOD_LEVELS } from './worlds/woodLevels';

/** Content target. Each world module can grow to this size without engine changes. */
export const TARGET_LEVELS_PER_WORLD = 10;

/** Ordered world modules are the single source for navigation and loading. */
export const LEVEL_CATALOG = [
  ...BEACH_LEVELS,
  ...WOOD_LEVELS,
  ...SPACE_LEVELS,
  ...FOREST_LEVELS,
] as const;

export const DEFAULT_LEVEL_ID = LEVEL_CATALOG[0].id;
