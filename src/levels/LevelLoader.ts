import type { Difficulty, LevelDefinition, ObstacleKind, TrapKind, Vec3Data, WorldId } from './types';

const WORLD_IDS: readonly WorldId[] = ['beach', 'wood', 'space', 'forest'];

export class LevelValidationError extends Error {
  public constructor(public readonly levelId: string, public readonly issues: readonly string[]) {
    super(`Invalid level "${levelId}": ${issues.join('; ')}`);
    this.name = 'LevelValidationError';
  }
}

/** Validates a data-only level before it is handed to rendering or physics. */
export function validateLevel(level: unknown): LevelDefinition {
  const candidate = level as Partial<LevelDefinition>;
  const issues: string[] = [];
  const levelId = typeof candidate?.id === 'string' ? candidate.id : '<unknown>';
  if (!isNonEmptyString(candidate?.id)) issues.push('id must be a non-empty string');
  if (!isNonEmptyString(candidate?.name)) issues.push('name must be a non-empty string');
  if (!isNonEmptyString(candidate?.lesson)) issues.push('lesson must be a non-empty string');
  if (!WORLD_IDS.includes(candidate?.world as WorldId)) issues.push(`world must be one of: ${WORLD_IDS.join(', ')}`);
  if (candidate?.sceneVariant !== 'lesson' && candidate?.sceneVariant !== 'adventure') issues.push('sceneVariant must be lesson or adventure');
  if (!isDifficulty(candidate?.difficulty)) issues.push('difficulty must be an integer from 1 to 5');
  if (!isPositiveNumber(candidate?.approximateLength)) issues.push('approximateLength must be greater than zero');
  if (!isNonEmptyString(candidate?.visualTheme)) issues.push('visualTheme must be a non-empty string');
  validateTextCollection(candidate?.mechanicIntroduction, 'mechanicIntroduction', issues);
  validateTextCollection(candidate?.challengeCombination, 'challengeCombination', issues);
  if (!isNonEmptyString(candidate?.completionCondition)) issues.push('completionCondition must be a non-empty string');
  validateVector(candidate?.spawn, 'spawn', issues);
  validateFiniteNumber(candidate?.fallResetY, 'fallResetY', issues);
  if (isFiniteNumber(candidate?.spawn?.y) && isFiniteNumber(candidate?.fallResetY) && candidate.fallResetY >= candidate.spawn.y) {
    issues.push('fallResetY must be lower than spawn.y');
  }
  validateCollection(candidate?.platforms, 'platforms', issues, validatePlatform);
  validateCollection(candidate?.ramps, 'ramps', issues, validateRamp);
  validateCollection(candidate?.hazards, 'hazards', issues, validateHazard);
  validateCollection(candidate?.movingPlatforms, 'movingPlatforms', issues, validateMovingPlatform);
  validateCollection(candidate?.trampolines, 'trampolines', issues, validateTrampoline);
  validateCollection(candidate?.conveyors, 'conveyors', issues, validateConveyor);
  validateCollection(candidate?.fans, 'fans', issues, validateFan);
  validateCollection(candidate?.hammers, 'hammers', issues, validateHammer);
  validateCollection(candidate?.obstacles, 'obstacles', issues, validateObstacle);
  validateCollection(candidate?.traps, 'traps', issues, validateTrap);
  validateCollection(candidate?.restZones, 'restZones', issues, validateRestZone);
  validateCollection(candidate?.gems, 'gems', issues, validateGem);
  validateCollection(candidate?.checkpoints, 'checkpoints', issues, validateCheckpoint);
  validateGoal(candidate?.goal, issues);
  validateMarble(candidate?.marble, issues);
  validateStarCriteria(candidate?.starCriteria, issues);
  validateUniqueIds(candidate, issues);
  if (issues.length > 0) throw new LevelValidationError(levelId, issues);
  return candidate as LevelDefinition;
}

/** Registry-backed loader keeps the game engine independent from individual levels. */
export class LevelLoader {
  private readonly levelsById: ReadonlyMap<string, LevelDefinition>;

  public constructor(levels: readonly LevelDefinition[]) {
    const validatedLevels = levels.map(validateLevel);
    const duplicateIds = validatedLevels.filter((level, index) => validatedLevels.findIndex(({ id }) => id === level.id) !== index);
    if (duplicateIds.length > 0) throw new LevelValidationError(duplicateIds[0].id, ['level ids must be unique in the catalog']);
    this.levelsById = new Map(validatedLevels.map((level) => [level.id, level]));
  }

  public load(id: string): LevelDefinition {
    const level = this.levelsById.get(id);
    if (!level) throw new Error(`Level "${id}" is not registered in the level catalog.`);
    return level;
  }

  public list(): readonly LevelDefinition[] {
    return [...this.levelsById.values()];
  }
}

function validateCollection<T>(value: unknown, name: string, issues: string[], validate: (item: T, label: string, issues: string[]) => void): void {
  if (!Array.isArray(value)) {
    issues.push(`${name} must be an array`);
    return;
  }
  value.forEach((item, index) => validate(item as T, `${name}[${index}]`, issues));
}

function validateSurface(value: { id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateIdAndPosition(value, label, issues);
  validatePositiveVector(value?.size, `${label}.size`, issues);
}

function validatePlatform(value: { id?: unknown; position?: unknown; rotationZ?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (value?.rotationZ !== undefined) validateFiniteNumber(value.rotationZ, `${label}.rotationZ`, issues);
}

function validateRamp(value: { angle?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  validateFiniteNumber(value?.angle, `${label}.angle`, issues);
}

function validateHazard(value: { kind?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (value?.kind !== 'water' && value?.kind !== 'spikes' && value?.kind !== 'void') issues.push(`${label}.kind is not supported`);
}

function validateMovingPlatform(value: { from?: unknown; to?: unknown; cyclesPerSecond?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  validateVector(value?.from, `${label}.from`, issues);
  validateVector(value?.to, `${label}.to`, issues);
  if (!isPositiveNumber(value?.cyclesPerSecond)) issues.push(`${label}.cyclesPerSecond must be greater than zero`);
}

function validateTrampoline(value: { launchSpeed?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (value?.launchSpeed !== undefined && !isPositiveNumber(value.launchSpeed)) issues.push(`${label}.launchSpeed must be greater than zero`);
}

function validateConveyor(value: { speed?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (!isFiniteNumber(value?.speed) || value.speed === 0) issues.push(`${label}.speed must be a non-zero finite number`);
}

function validateFan(value: { direction?: unknown; force?: unknown; lift?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (value?.direction !== 'left' && value?.direction !== 'right') issues.push(`${label}.direction must be left or right`);
  if (!isPositiveNumber(value?.force)) issues.push(`${label}.force must be greater than zero`);
  if (value?.lift !== undefined) validateFiniteNumber(value.lift, `${label}.lift`, issues);
}

function validateHammer(value: { id?: unknown; position?: unknown; length?: unknown; thickness?: unknown; mode?: unknown; cyclesPerSecond?: unknown; swingAngle?: unknown; startAngle?: unknown }, label: string, issues: string[]): void {
  validateIdAndPosition(value, label, issues);
  if (!isPositiveNumber(value?.length)) issues.push(`${label}.length must be greater than zero`);
  if (!isPositiveNumber(value?.thickness)) issues.push(`${label}.thickness must be greater than zero`);
  if (value?.mode !== 'swing' && value?.mode !== 'spin') issues.push(`${label}.mode must be swing or spin`);
  if (!isPositiveNumber(value?.cyclesPerSecond)) issues.push(`${label}.cyclesPerSecond must be greater than zero`);
  if (value?.swingAngle !== undefined && !isPositiveNumber(value.swingAngle)) issues.push(`${label}.swingAngle must be greater than zero`);
  if (value?.startAngle !== undefined) validateFiniteNumber(value.startAngle, `${label}.startAngle`, issues);
}

function validateObstacle(value: { kind?: unknown; cue?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (!OBSTACLE_KINDS.includes(value?.kind as ObstacleKind)) issues.push(`${label}.kind is not supported`);
  if (!isNonEmptyString(value?.cue)) issues.push(`${label}.cue must be a non-empty string`);
}

function validateTrap(value: { kind?: unknown; cue?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (!TRAP_KINDS.includes(value?.kind as TrapKind)) issues.push(`${label}.kind is not supported`);
  if (!isNonEmptyString(value?.cue)) issues.push(`${label}.cue must be a non-empty string`);
}

function validateRestZone(value: { label?: unknown; id?: unknown; position?: unknown; size?: unknown }, label: string, issues: string[]): void {
  validateSurface(value, label, issues);
  if (!isNonEmptyString(value?.label)) issues.push(`${label}.label must be a non-empty string`);
}

function validateGem(value: { id?: unknown; position?: unknown; radius?: unknown }, label: string, issues: string[]): void {
  validateIdAndPosition(value, label, issues);
  if (value?.radius !== undefined && !isPositiveNumber(value.radius)) issues.push(`${label}.radius must be greater than zero`);
}

function validateCheckpoint(value: { id?: unknown; position?: unknown; radius?: unknown; respawn?: unknown }, label: string, issues: string[]): void {
  validateGem(value, label, issues);
  validateVector(value?.respawn, `${label}.respawn`, issues);
}

function validateGoal(value: { position?: unknown; radius?: unknown } | undefined, issues: string[]): void {
  validateVector(value?.position, 'goal.position', issues);
  if (value?.radius !== undefined && !isPositiveNumber(value.radius)) issues.push('goal.radius must be greater than zero');
}

function validateMarble(value: unknown, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push('marble must be an object');
    return;
  }
  if (value.radius !== undefined && !isPositiveNumber(value.radius)) issues.push('marble.radius must be greater than zero');
  if (value.material === undefined) return;
  if (!isRecord(value.material)) {
    issues.push('marble.material must be an object');
    return;
  }
  if (!isNonEmptyString(value.material.color)) issues.push('marble.material.color must be a non-empty string');
  validateUnitNumber(value.material.roughness, 'marble.material.roughness', issues);
  validateUnitNumber(value.material.metalness, 'marble.material.metalness', issues);
  if (value.material.transmission !== undefined) validateUnitNumber(value.material.transmission, 'marble.material.transmission', issues);
}

function validateStarCriteria(value: unknown, issues: string[]): void {
  if (value === undefined) return;
  if (!isRecord(value)) {
    issues.push('starCriteria must be an object');
    return;
  }
  if (!isPositiveNumber(value.majorityGemRatio) || value.majorityGemRatio > 1) {
    issues.push('starCriteria.majorityGemRatio must be greater than zero and at most one');
  }
  if (!Number.isInteger(value.maxRestartsForThirdStar) || (value.maxRestartsForThirdStar as number) < 0) {
    issues.push('starCriteria.maxRestartsForThirdStar must be a non-negative integer');
  }
}

function validateIdAndPosition(value: { id?: unknown; position?: unknown } | undefined, label: string, issues: string[]): void {
  if (!isNonEmptyString(value?.id)) issues.push(`${label}.id must be a non-empty string`);
  validateVector(value?.position, `${label}.position`, issues);
}

function validateVector(value: unknown, label: string, issues: string[]): void {
  const vector = value as Partial<Vec3Data> | undefined;
  if (!vector || !isFiniteNumber(vector.x) || !isFiniteNumber(vector.y) || !isFiniteNumber(vector.z)) issues.push(`${label} must contain finite x, y and z numbers`);
}

function validatePositiveVector(value: unknown, label: string, issues: string[]): void {
  const vector = value as Partial<Vec3Data> | undefined;
  if (!vector || !isPositiveNumber(vector.x) || !isPositiveNumber(vector.y) || !isPositiveNumber(vector.z)) issues.push(`${label} must contain positive x, y and z numbers`);
}

function validateUniqueIds(level: Partial<LevelDefinition>, issues: string[]): void {
  const collections: unknown[] = [level?.platforms, level?.ramps, level?.hazards, level?.movingPlatforms, level?.trampolines, level?.conveyors, level?.fans, level?.hammers, level?.obstacles, level?.traps, level?.restZones, level?.gems, level?.checkpoints];
  const ids = new Set<string>();
  collections.forEach((entities) => {
    if (!Array.isArray(entities)) return;
    entities.forEach((entity) => {
      const id = (entity as { id?: unknown })?.id;
      if (typeof id !== 'string') return;
      if (ids.has(id)) issues.push(`entity id "${id}" is repeated`);
      ids.add(id);
    });
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function isDifficulty(value: unknown): value is Difficulty {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

function validateTextCollection(value: unknown, name: string, issues: string[]): void {
  if (!Array.isArray(value) || value.length === 0 || value.some((item) => !isNonEmptyString(item))) {
    issues.push(`${name} must be a non-empty array of text`);
  }
}

const OBSTACLE_KINDS: readonly ObstacleKind[] = ['roller', 'fan', 'moving-wall', 'spinner', 'slow-hammer', 'tilting-block', 'slippery-surface', 'bounce-zone'];
const TRAP_KINDS: readonly TrapKind[] = ['gap', 'disappearing-platform', 'temporary-door', 'switch-platform', 'chained-obstacles'];

function validateFiniteNumber(value: unknown, label: string, issues: string[]): void {
  if (!isFiniteNumber(value)) issues.push(`${label} must be a finite number`);
}

function validateUnitNumber(value: unknown, label: string, issues: string[]): void {
  if (!isFiniteNumber(value) || value < 0 || value > 1) issues.push(`${label} must be between zero and one`);
}
