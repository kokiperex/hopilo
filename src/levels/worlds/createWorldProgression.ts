import type { Difficulty, HazardKind, LevelDefinition, ObstacleKind, TrapKind, WorldId } from '../types';

export interface WorldProgressionTheme {
  surface: string;
  accent: string;
  hazard: HazardKind;
  visualTheme: string;
}

export interface LevelBeat {
  slug: string;
  name: string;
  lesson: string;
  length: number;
  difficulty: Difficulty;
  newTrap: string;
  trapKind?: TrapKind;
  obstacleKind?: ObstacleKind;
  mechanics: readonly string[];
  reason: string;
}

type SectionFeature =
  | 'plain'
  | 'slope'
  | 'steps'
  | 'moving-horizontal'
  | 'moving-vertical'
  | 'bounce'
  | 'fan'
  | 'conveyor'
  | 'hammer'
  | 'spinner'
  | 'moving-wall'
  | 'spikes';

interface RouteSection {
  center: number;
  start: number;
  width: number;
  height: number;
  surfaceY: number;
  gapCenter: number;
  gap: number;
}

const WORLD_OFFSETS: Record<WorldId, number> = { beach: 0, wood: 2, space: 4, forest: 6 };

/**
 * Expands each progression brief into a route whose physical span closely
 * matches its authored length. The deterministic feature palette keeps all 40
 * levels distinct without hiding gameplay decisions in the renderer.
 */
export function createWorldProgression(world: WorldId, theme: WorldProgressionTheme, beats: readonly LevelBeat[]): readonly LevelDefinition[] {
  return beats.map((beat, index) => createLevel(world, theme, beat, index));
}

function createLevel(world: WorldId, theme: WorldProgressionTheme, beat: LevelBeat, index: number): LevelDefinition {
  const routeLength = beat.length + 16 + index * 4;
  const startX = -routeLength / 2;
  const startWidth = 8;
  const sectionCount = Math.max(4, Math.round((routeLength - startWidth) / 8.4));
  const gapSizes = Array.from({ length: sectionCount }, (_, section) => gapForSection(index, section));
  const playableWidth = routeLength - startWidth - gapSizes.reduce((sum, gap) => sum + gap, 0);
  const regularWidth = playableWidth / sectionCount;
  const platforms: LevelDefinition['platforms'] = [platform('start', startX + startWidth / 2, -0.45, startWidth, theme.surface)];
  const ramps: LevelDefinition['ramps'] = [];
  const hazards: LevelDefinition['hazards'] = [];
  const movingPlatforms: LevelDefinition['movingPlatforms'] = [];
  const trampolines: LevelDefinition['trampolines'] = [];
  const conveyors: LevelDefinition['conveyors'] = [];
  const fans: LevelDefinition['fans'] = [];
  const hammers: LevelDefinition['hammers'] = [];
  const gems: LevelDefinition['gems'] = [];
  const checkpoints: LevelDefinition['checkpoints'] = [];
  const restZones: LevelDefinition['restZones'] = [];
  const obstacles: LevelDefinition['obstacles'] = [];
  const traps: LevelDefinition['traps'] = [];
  const features = featurePalette(world, index, beat.obstacleKind);

  restZones.push({ id: 'rest-start', label: 'Zona segura de inicio', position: { x: startX + startWidth / 2, y: -0.45, z: 0 }, size: { x: startWidth, y: 0.9, z: 2.8 }, color: theme.surface });
  gems.push({ id: 'gem-start', position: { x: startX + startWidth - 1.15, y: 1, z: 0 } });

  let cursor = startX + startWidth;
  let previousHeight = -0.45;
  for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex += 1) {
    const gap = gapSizes[sectionIndex];
    const gapCenter = cursor + gap / 2;
    addGap(sectionIndex, gapCenter, gap, theme, hazards, traps);
    cursor += gap;

    const isRest = (sectionIndex + 1) % 4 === 0 || sectionIndex === sectionCount - 1;
    const feature = isRest ? 'plain' : features[(sectionIndex + WORLD_OFFSETS[world] + index) % features.length];
    const height = sectionHeight(world, sectionIndex, index, previousHeight, isRest, feature);
    const width = regularWidth;
    const center = cursor + width / 2;
    const routeSection: RouteSection = { center, start: cursor, width, height, surfaceY: height + 0.45, gapCenter, gap };
    const color = sectionIndex % 3 === 1 ? theme.accent : theme.surface;

    if (feature === 'slope') {
      const angle = (sectionIndex + index) % 2 === 0 ? 0.12 : -0.12;
      platforms.push({ ...platform(`section-${sectionIndex + 1}`, center, height, width, color), rotationZ: angle });
    } else {
      platforms.push(platform(`section-${sectionIndex + 1}`, center, height, width, color));
    }

    addFeature(feature, routeSection, sectionIndex, index, theme, { platforms, ramps, hazards, movingPlatforms, trampolines, conveyors, fans, hammers, obstacles });
    addGemTrail(routeSection, sectionIndex, feature, gems);

    if (isRest) {
      restZones.push({ id: `rest-${sectionIndex + 1}`, label: sectionIndex === sectionCount - 1 ? 'Zona segura antes de la meta' : 'Plataforma amplia para recuperar el control', position: { x: center, y: height, z: 0 }, size: { x: width, y: 0.9, z: 2.8 }, color: theme.surface });
    }
    if (shouldAddCheckpoint(index, sectionIndex, sectionCount, isRest)) {
      checkpoints.push({ id: `checkpoint-${sectionIndex + 1}`, position: { x: center, y: routeSection.surfaceY + 0.9, z: 0 }, respawn: { x: center - Math.min(1.2, width * 0.18), y: routeSection.surfaceY + 1.05, z: 0 } });
    }

    previousHeight = height;
    cursor += width;
  }

  if (beat.trapKind && beat.trapKind !== 'gap') {
    const cuePlatform = platforms[Math.max(1, platforms.length - 3)];
    traps.push({ id: 'featured-trap', kind: beat.trapKind, cue: cueForTrap(beat.trapKind), position: { x: cuePlatform.position.x, y: cuePlatform.position.y + 0.6, z: 0 }, size: { x: Math.min(2.4, cuePlatform.size.x * 0.5), y: 0.6, z: 2.6 }, color: theme.accent });
  }

  // Faro de espuma is the first air-current lesson.  Its breeze must help a
  // five-year-old clear the next gap, leaving steering as a gentle correction
  // instead of continually returning the marble to the previous platform.
  if (world === 'beach' && index === 4) {
    const lessonFan = fans[0];
    if (lessonFan) {
      lessonFan.direction = 'right';
      lessonFan.impulse = 0.9;
      lessonFan.maxSpeed = 3.8;
      lessonFan.lift = 0.3;
    }
  }

  const lastPlatform = platforms[platforms.length - 1];
  const goalX = lastPlatform.position.x + lastPlatform.size.x / 2 - 1.15;
  return {
    id: `${world}-${String(index + 1).padStart(2, '0')}`,
    name: beat.name,
    lesson: beat.lesson,
    world,
    sceneVariant: index < 2 ? 'lesson' : 'adventure',
    difficulty: beat.difficulty,
    approximateLength: routeLength,
    visualTheme: theme.visualTheme,
    mechanicIntroduction: [beat.newTrap, 'zona segura después de cada reto nuevo'],
    challengeCombination: beat.mechanics,
    completionCondition: 'Llega a la bandera a cuadros; las gemas son opcionales.',
    spawn: { x: startX + 1.5, y: 1.05, z: 0 },
    platforms,
    ramps,
    hazards,
    movingPlatforms,
    trampolines,
    conveyors,
    fans,
    hammers,
    obstacles,
    traps,
    restZones,
    gems,
    checkpoints,
    goal: { position: { x: goalX, y: lastPlatform.position.y + 1.5, z: 0 } },
    fallResetY: -4.2,
    starCriteria: { majorityGemRatio: 0.7, maxRestartsForThirdStar: index < 4 ? 3 : 5 },
  };
}

function featurePalette(world: WorldId, levelIndex: number, featured?: ObstacleKind): SectionFeature[] {
  const palette: SectionFeature[] = levelIndex === 0 ? ['plain', 'slope', 'steps'] : ['slope', 'steps', 'moving-horizontal'];
  if (levelIndex >= 2) palette.push('bounce');
  if (levelIndex >= 3) palette.push(world === 'space' ? 'spinner' : 'moving-vertical');
  if (levelIndex >= 4 && (world === 'beach' || world === 'forest' || world === 'space')) palette.push('fan');
  if (levelIndex >= 4 && world === 'wood') palette.push('conveyor');
  if (levelIndex >= 5) palette.push('moving-vertical');
  if (levelIndex >= 5 && world === 'wood') palette.push('hammer');
  if (levelIndex >= 6) palette.push(world === 'wood' || world === 'beach' || world === 'space' ? 'conveyor' : 'spinner');
  if (levelIndex >= 7) palette.push('moving-wall');
  if (levelIndex >= 8) palette.push('spikes');
  const featuredSection = featureForObstacle(featured);
  if (featuredSection && !palette.includes(featuredSection)) palette.push(featuredSection);
  return palette;
}

function featureForObstacle(kind?: ObstacleKind): SectionFeature | undefined {
  if (kind === 'roller' || kind === 'slippery-surface') return 'conveyor';
  if (kind === 'fan') return 'fan';
  if (kind === 'moving-wall') return 'moving-wall';
  if (kind === 'spinner') return 'spinner';
  if (kind === 'slow-hammer') return 'hammer';
  if (kind === 'bounce-zone') return 'bounce';
  if (kind === 'tilting-block') return 'slope';
  return undefined;
}

function addFeature(
  feature: SectionFeature,
  section: RouteSection,
  sectionIndex: number,
  levelIndex: number,
  theme: WorldProgressionTheme,
  collections: Pick<LevelDefinition, 'platforms' | 'ramps' | 'hazards' | 'movingPlatforms' | 'trampolines' | 'conveyors' | 'fans' | 'hammers' | 'obstacles'>,
): void {
  const id = `${feature}-${sectionIndex + 1}`;
  const direction = (sectionIndex + levelIndex) % 2 === 0 ? 1 : -1;
  if (feature === 'steps') {
    const stepWidth = Math.min(1.25, section.width / 4.6);
    [-1, 0, 1].forEach((offset, step) => collections.platforms.push({ id: `${id}-${step}`, position: { x: section.center + offset * stepWidth, y: section.surfaceY + 0.14 + step * 0.16, z: 0 }, size: { x: stepWidth, y: 0.28, z: 2.65 }, color: theme.accent }));
  } else if (feature === 'moving-horizontal') {
    const y = Math.max(section.surfaceY + 0.2, 0.1);
    collections.movingPlatforms.push({ id, position: { x: section.gapCenter, y, z: 0 }, from: { x: section.gapCenter - 0.55, y, z: 0 }, to: { x: section.gapCenter + 0.55, y, z: 0 }, size: { x: Math.min(2, section.gap + 0.55), y: 0.32, z: 2.35 }, cyclesPerSecond: 0.12 + levelIndex * 0.006, color: theme.accent });
  } else if (feature === 'moving-vertical') {
    const x = section.center;
    const lowY = section.surfaceY + 0.28;
    collections.movingPlatforms.push({ id, position: { x, y: lowY, z: 0 }, from: { x, y: lowY, z: 0 }, to: { x, y: lowY + 1.15, z: 0 }, size: { x: Math.min(2.25, section.width * 0.42), y: 0.32, z: 2.35 }, cyclesPerSecond: 0.1 + levelIndex * 0.005, color: theme.accent });
  } else if (feature === 'bounce') {
    collections.trampolines.push({ id, position: { x: section.center, y: section.surfaceY + 0.16, z: 0 }, size: { x: Math.min(1.8, section.width * 0.34), y: 0.32, z: 2.15 }, launchSpeed: 10.5 + Math.min(levelIndex, 5) * 0.2, color: theme.accent });
  } else if (feature === 'fan') {
    collections.fans.push({ id, position: { x: section.center, y: section.surfaceY + 1.2, z: 0 }, size: { x: Math.min(2.8, section.width * 0.52), y: 2.3, z: 2.55 }, direction: direction > 0 ? 'right' : 'left', impulse: 1.2, maxSpeed: 3.2, lift: 0.35, color: theme.accent });
  } else if (feature === 'conveyor') {
    collections.conveyors.push({ id, position: { x: section.center, y: section.surfaceY + 0.16, z: 0 }, size: { x: Math.min(2.7, section.width * 0.52), y: 0.32, z: 2.3 }, speed: direction * (1.25 + levelIndex * 0.08), maxSpeed: 2.8, color: theme.accent });
  } else if (feature === 'hammer' || feature === 'spinner') {
    collections.hammers.push({ id, position: { x: section.center, y: section.surfaceY + 2.25, z: 0 }, length: 1.65, thickness: 0.34, mode: feature === 'spinner' ? 'spin' : 'swing', cyclesPerSecond: feature === 'spinner' ? 0.115 : 0.18, swingAngle: Math.PI / 3.2, color: theme.accent });
  } else if (feature === 'moving-wall') {
    collections.movingPlatforms.push({ id, position: { x: section.center, y: section.surfaceY + 1.15, z: 0 }, from: { x: section.center - 1, y: section.surfaceY + 1.15, z: 0 }, to: { x: section.center + 1, y: section.surfaceY + 1.15, z: 0 }, size: { x: 0.36, y: 2.15, z: 2.4 }, cyclesPerSecond: 0.14, color: theme.accent });
  } else if (feature === 'spikes') {
    const spikeWidth = Math.min(1.55, section.width * 0.28);
    collections.hazards.push({ id, kind: 'spikes', position: { x: section.center, y: section.surfaceY + 0.27, z: 0 }, size: { x: spikeWidth, y: 0.55, z: 2.35 } });
  }

  if (feature !== 'plain' && feature !== 'steps') {
    collections.obstacles.push({ id: `cue-${id}`, kind: obstacleForFeature(feature), cue: cueForFeature(feature), position: { x: section.center, y: section.surfaceY + 0.55, z: 0 }, size: { x: Math.min(2.5, section.width * 0.5), y: 1, z: 2.3 }, color: theme.accent });
  }
}

function addGemTrail(section: RouteSection, sectionIndex: number, feature: SectionFeature, gems: LevelDefinition['gems']): void {
  const raised = feature === 'bounce' || feature === 'moving-vertical' || feature === 'spikes';
  const count = raised ? 3 : sectionIndex % 3 === 0 ? 2 : 1;
  for (let gemIndex = 0; gemIndex < count; gemIndex += 1) {
    const progress = count === 1 ? 0.5 : (gemIndex + 1) / (count + 1);
    const arc = count === 1 ? 0 : Math.sin(progress * Math.PI) * (raised ? 1.15 : 0.35);
    gems.push({ id: `gem-${sectionIndex + 1}-${gemIndex + 1}`, position: { x: section.start + section.width * progress, y: section.surfaceY + 0.95 + arc, z: 0 } });
  }
}

function addGap(sectionIndex: number, center: number, gap: number, theme: WorldProgressionTheme, hazards: LevelDefinition['hazards'], traps: LevelDefinition['traps']): void {
  hazards.push({ id: `gap-${sectionIndex + 1}`, kind: theme.hazard, position: { x: center, y: -1.15, z: 0 }, size: { x: gap, y: 0.72, z: 2.8 } });
  traps.push({ id: `gap-cue-${sectionIndex + 1}`, kind: 'gap', cue: theme.hazard === 'water' ? 'Agua brillante y espuma marcan el hueco.' : 'El vacío oscuro y los bordes iluminados marcan el hueco.', position: { x: center, y: -1.15, z: 0 }, size: { x: gap, y: 0.72, z: 2.8 } });
}

function gapForSection(levelIndex: number, sectionIndex: number): number {
  // The marble is 1.3 m across, so every gap must exceed its diameter to require a jump.
  if (levelIndex === 0) return sectionIndex % 3 === 1 ? 1.75 : 1.45;
  return 1.65 + ((sectionIndex + levelIndex) % 3) * 0.22 + Math.min(levelIndex, 6) * 0.11;
}

function sectionHeight(world: WorldId, sectionIndex: number, levelIndex: number, previous: number, isRest: boolean, feature: SectionFeature): number {
  if (isRest) return clamp(previous * 0.45, -0.45, 0.2);
  const patterns: Record<WorldId, readonly number[]> = {
    beach: [-0.45, -0.18, 0.08, -0.12, -0.38, 0.02],
    wood: [-0.45, -0.05, 0.22, 0.22, -0.18, 0.1],
    space: [-0.35, 0.12, 0.4, 0.02, -0.25, 0.26],
    forest: [-0.45, -0.15, 0.18, -0.08, 0.26, -0.22],
  };
  const target = patterns[world][(sectionIndex + levelIndex) % patterns[world].length];
  const limitedTarget = feature === 'moving-vertical' ? Math.min(target, 0.05) : target;
  return clamp(limitedTarget, previous - 0.55, previous + 0.55);
}

function shouldAddCheckpoint(levelIndex: number, sectionIndex: number, sectionCount: number, isRest: boolean): boolean {
  if (levelIndex === 0 || !isRest || sectionIndex === sectionCount - 1) return false;
  const interval = levelIndex < 4 ? 8 : 4;
  return (sectionIndex + 1) % interval === 0;
}

function platform(id: string, x: number, y: number, width: number, color: string): LevelDefinition['platforms'][number] {
  return { id, position: { x, y, z: 0 }, size: { x: width, y: 0.9, z: 2.8 }, color };
}

function obstacleForFeature(feature: SectionFeature): ObstacleKind {
  if (feature === 'fan') return 'fan';
  if (feature === 'conveyor') return 'roller';
  if (feature === 'hammer') return 'slow-hammer';
  if (feature === 'spinner') return 'spinner';
  if (feature === 'moving-wall') return 'moving-wall';
  if (feature === 'bounce') return 'bounce-zone';
  if (feature === 'slope') return 'tilting-block';
  return 'moving-wall';
}

function cueForFeature(feature: SectionFeature): string {
  return {
    plain: 'Plataforma amplia y estable.', slope: 'Pendiente de color que anticipa el cambio de altura.', steps: 'Escalones bajos con bordes contrastantes.',
    'moving-horizontal': 'Balsa ancha que se desplaza lentamente.', 'moving-vertical': 'Plataforma luminosa que sube y baja despacio.', bounce: 'Almohadilla elástica con franjas luminosas.',
    fan: 'Aspas grandes con brillo y movimiento suave.', conveyor: 'Rodillo rayado que gira lentamente.', hammer: 'Martillo grande que se balancea lentamente.',
    spinner: 'Brazos redondeados que giran despacio.', 'moving-wall': 'Muro de color vivo que se desplaza despacio.', spikes: 'Pinchos claros y separados, visibles desde la plataforma anterior.',
  }[feature];
}

function cueForTrap(kind: TrapKind): string {
  return {
    gap: 'Bordes y sombra visibles antes de la caída.', 'disappearing-platform': 'La plataforma parpadea en color antes de desaparecer.',
    'temporary-door': 'La puerta muestra una luz pulsante mientras está abierta.', 'switch-platform': 'El interruptor grande tiene el mismo color que la plataforma que activa.',
    'chained-obstacles': 'Cada elemento se ve desde una plataforma amplia anterior.',
  }[kind];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
