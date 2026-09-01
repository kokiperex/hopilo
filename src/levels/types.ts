/** Serializable position and size used by level data. */
export interface Vec3Data {
  x: number;
  y: number;
  z: number;
}

export type WorldId = 'beach' | 'wood' | 'space' | 'forest';

export type SceneVariant = 'lesson' | 'adventure';

/** Child-friendly difficulty band. It is intentionally independent of time. */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/**
 * Authoring-only labels for the reusable low-poly obstacle pieces.
 * The physical route remains expressed through platforms, moving platforms and
 * hazards, so the level engine never needs to know world-specific names.
 */
export type ObstacleKind =
  | 'roller'
  | 'fan'
  | 'moving-wall'
  | 'spinner'
  | 'slow-hammer'
  | 'tilting-block'
  | 'slippery-surface'
  | 'bounce-zone';

export type TrapKind =
  | 'gap'
  | 'disappearing-platform'
  | 'temporary-door'
  | 'switch-platform'
  | 'chained-obstacles';

/** Star rules can be tuned per level without changing the game loop. */
export interface StarCriteria {
  /** Fraction of the level's gems needed for the second star. */
  majorityGemRatio: number;
  /** Restarts allowed while still earning the third star. */
  maxRestartsForThirdStar: number;
}

export interface LevelEntityDefinition {
  id: string;
  position: Vec3Data;
}

export interface SurfaceDefinition extends LevelEntityDefinition {
  size: Vec3Data;
  color?: string;
}

/** A fixed, horizontal or rotated solid surface. */
export interface PlatformDefinition extends SurfaceDefinition {
  rotationZ?: number;
}

/** A fixed inclined surface. The angle is expressed in radians. */
export interface RampDefinition extends SurfaceDefinition {
  angle: number;
}

/** A solid platform that moves continuously between two data-defined endpoints. */
export interface MovingPlatformDefinition extends SurfaceDefinition {
  from: Vec3Data;
  to: Vec3Data;
  /** Complete back-and-forth cycles per second. */
  cyclesPerSecond: number;
}

/** A solid pad that gives the marble a predictable upward launch. */
export interface TrampolineDefinition extends SurfaceDefinition {
  /** Initial upward speed applied when the marble lands on the pad. */
  launchSpeed?: number;
}

/** A fixed solid surface that gently carries the marble in one direction. */
export interface ConveyorDefinition extends SurfaceDefinition {
  /** Horizontal speed in world metres per second; negative values move left. */
  speed: number;
}

/** A visible air current. Its box is a sensor, never a solid wall. */
export interface FanDefinition extends SurfaceDefinition {
  direction: 'left' | 'right';
  /** Continuous horizontal force in Rapier world units. */
  force: number;
  /** Optional small lift so the airflow remains readable while jumping. */
  lift?: number;
}

/** A kinematic arm that swings from its position, which is its pivot. */
export interface HammerDefinition extends LevelEntityDefinition {
  length: number;
  thickness: number;
  mode: 'swing' | 'spin';
  /** Complete motion cycles per second. */
  cyclesPerSecond: number;
  /** Maximum swing away from startAngle, in radians. Ignored by spin mode. */
  swingAngle?: number;
  /** Clockwise rotation from the horizontal at rest, in radians. */
  startAngle?: number;
  color?: string;
}

/** A clearly signalled obstacle that can be rendered from shared primitives. */
export interface ObstacleDefinition extends SurfaceDefinition {
  kind: ObstacleKind;
  /** Short description of the colour, movement or silhouette that warns the player. */
  cue: string;
}

/** A design label for traps already represented physically by the route data. */
export interface TrapDefinition extends SurfaceDefinition {
  kind: TrapKind;
  cue: string;
}

/** A wide, safe platform placed after a demanding section. */
export interface RestZoneDefinition extends SurfaceDefinition {
  label: string;
}

export type HazardKind = 'water' | 'spikes' | 'void';

export interface HazardDefinition extends SurfaceDefinition {
  kind: HazardKind;
}

export interface GemDefinition extends LevelEntityDefinition {
  radius?: number;
}

export interface CheckpointDefinition extends LevelEntityDefinition {
  radius?: number;
  respawn: Vec3Data;
}

export interface GoalDefinition {
  position: Vec3Data;
  radius?: number;
}

export interface MarbleMaterialDefinition {
  color: string;
  roughness: number;
  metalness: number;
  transmission?: number;
}

/** Optional visual tuning; spawn always belongs to the level itself. */
export interface MarbleDefinition {
  radius?: number;
  material?: MarbleMaterialDefinition;
}

/**
 * A complete level description. It deliberately contains no Three.js or Rapier
 * values so the same data can be authored and validated independently of the engine.
 */
export interface LevelDefinition {
  id: string;
  /** Short selection-screen label. Gameplay itself remains text-free. */
  name: string;
  /** One concise description of the skill introduced by the circuit. */
  lesson: string;
  world: WorldId;
  sceneVariant: SceneVariant;
  difficulty: Difficulty;
  /** Approximate playable length in world metres; never a time target. */
  approximateLength: number;
  visualTheme: string;
  /** Ordered, single-purpose teaching beats. */
  mechanicIntroduction: readonly string[];
  /** Mechanics used together in the latter portions of the circuit. */
  challengeCombination: readonly string[];
  completionCondition: string;
  spawn: Vec3Data;
  platforms: PlatformDefinition[];
  ramps: RampDefinition[];
  hazards: HazardDefinition[];
  movingPlatforms: MovingPlatformDefinition[];
  trampolines: TrampolineDefinition[];
  conveyors: ConveyorDefinition[];
  fans: FanDefinition[];
  hammers: HammerDefinition[];
  obstacles: ObstacleDefinition[];
  traps: TrapDefinition[];
  restZones: RestZoneDefinition[];
  gems: GemDefinition[];
  checkpoints: CheckpointDefinition[];
  goal: GoalDefinition;
  /** Height below which the marble returns to its latest checkpoint. */
  fallResetY: number;
  marble?: MarbleDefinition;
  starCriteria?: StarCriteria;
}
