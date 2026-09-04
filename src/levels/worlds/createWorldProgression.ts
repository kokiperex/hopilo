import type { Difficulty, HazardKind, LevelDefinition, ObstacleKind, TrapKind, WorldId } from '../types';

export interface WorldProgressionTheme {
  surface: string;
  accent: string;
  hazard: HazardKind;
  visualTheme: string;
}

/** A compact authoring brief. `length` is the intended physical span in metres. */
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

type SectionFeature = 'plain' | 'slope' | 'steps' | 'moving-horizontal' | 'moving-vertical' | 'bounce' | 'fan' | 'conveyor' | 'hammer' | 'spinner' | 'moving-wall' | 'spikes';

interface RouteSection {
  center: number;
  start: number;
  width: number;
  height: number;
  surfaceY: number;
  gapCenter: number;
  gap: number;
}

const START_WIDTH = 8;
const WORLD_OFFSETS: Record<WorldId, number> = { beach: 0, wood: 2, space: 4, forest: 6 };

/**
 * Expands authoring briefs into deterministic data-only routes. Section count
 * drives pacing; authored metres drive final span, so labels and physics agree.
 */
export function createWorldProgression(world: WorldId, theme: WorldProgressionTheme, beats: readonly LevelBeat[]): readonly LevelDefinition[] {
  return beats.map((beat, index) => createLevel(world, theme, beat, index));
}

function createLevel(world: WorldId, theme: WorldProgressionTheme, beat: LevelBeat, levelIndex: number): LevelDefinition {
  const sectionCount = sectionCountForLevel(levelIndex);
  const restSections = restSectionsForLevel(levelIndex, sectionCount);
  const gaps = Array.from({ length: sectionCount }, (_, sectionIndex) => gapForSection(levelIndex, sectionIndex));
  const widths = sectionWidthsForLevel(levelIndex, sectionCount, restSections, gaps, beat.length);
  const platforms: LevelDefinition['platforms'] = [platform('start', -beat.length / 2 + START_WIDTH / 2, -0.45, START_WIDTH, theme.surface)];
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
  const startX = -beat.length / 2;
  const actEnds = actEndsForLevel(levelIndex, sectionCount);

  restZones.push({ id: 'rest-start', label: 'Zona segura de inicio', position: { x: startX + START_WIDTH / 2, y: -0.45, z: 0 }, size: { x: START_WIDTH, y: 0.9, z: 2.8 }, color: theme.surface });
  gems.push({ id: 'gem-start', position: { x: startX + START_WIDTH - 1.15, y: 1, z: 0 } });

  let cursor = startX + START_WIDTH;
  let previousHeight = -0.45;
  let finalPlatform = platforms[0];
  for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex += 1) {
    const gap = gaps[sectionIndex];
    const gapCenter = cursor + gap / 2;
    addGap(sectionIndex, gapCenter, gap, theme, hazards, traps);
    cursor += gap;

    const isRest = restSections.has(sectionIndex);
    const feature = isRest ? 'plain' : featureForSection(world, levelIndex, beat.obstacleKind, sectionIndex);
    const height = sectionHeight(world, sectionIndex, levelIndex, previousHeight, isRest, feature);
    const width = widths[sectionIndex];
    const center = cursor + width / 2;
    const section: RouteSection = { center, start: cursor, width, height, surfaceY: height + 0.45, gapCenter, gap };
    const color = isRest || sectionIndex % 3 !== 1 ? theme.surface : theme.accent;
    const mainPlatform = feature === 'slope'
      ? { ...platform(`section-${sectionIndex + 1}`, center, height, width, color), rotationZ: (sectionIndex + levelIndex) % 2 === 0 ? 0.12 : -0.12 }
      : platform(`section-${sectionIndex + 1}`, center, height, width, color);
    platforms.push(mainPlatform);
    finalPlatform = mainPlatform;

    addFeature(feature, section, sectionIndex, levelIndex, theme, { platforms, ramps, hazards, movingPlatforms, trampolines, conveyors, fans, hammers, obstacles });
    addGemTrail(section, sectionIndex, levelIndex, isRest, feature, gems);
    if (isRest) {
      const isActEnd = actEnds.includes(sectionIndex);
      restZones.push({ id: `rest-${sectionIndex + 1}`, label: sectionIndex === sectionCount - 1 ? 'Llegada amplia antes de la meta' : isActEnd ? 'Zona segura después del acto' : 'Plataforma amplia para recuperar el control', position: { x: center, y: height, z: 0 }, size: { x: width, y: 0.9, z: 2.8 }, color: theme.surface });
    }
    if (shouldAddCheckpoint(levelIndex, sectionIndex, sectionCount, isRest, actEnds)) {
      checkpoints.push({ id: `checkpoint-${sectionIndex + 1}`, position: { x: center, y: section.surfaceY + 0.9, z: 0 }, respawn: { x: center - Math.min(1.2, width * 0.18), y: section.surfaceY + 1.05, z: 0 } });
    }
    previousHeight = height;
    cursor += width;
  }

  if (beat.trapKind && beat.trapKind !== 'gap') {
    const cuePlatform = platforms[Math.max(1, platforms.length - 3)];
    traps.push({ id: 'featured-trap', kind: beat.trapKind, cue: cueForTrap(beat.trapKind), position: { x: cuePlatform.position.x, y: cuePlatform.position.y + 0.6, z: 0 }, size: { x: Math.min(2.4, cuePlatform.size.x * 0.5), y: 0.6, z: 2.6 }, color: theme.accent });
  }

  const level: LevelDefinition = {
    id: `${world}-${String(levelIndex + 1).padStart(2, '0')}`,
    name: beat.name,
    lesson: beat.lesson,
    world,
    sceneVariant: levelIndex < 2 ? 'lesson' : 'adventure',
    difficulty: beat.difficulty,
    approximateLength: beat.length,
    visualTheme: theme.visualTheme,
    mechanicIntroduction: [beat.newTrap, levelIndex < 3 ? 'lectura amplia antes del reto' : 'zona segura después del reto nuevo'],
    challengeCombination: levelIndex === 9 ? finalActDescription(world) : beat.mechanics,
    completionCondition: 'Llega a la bandera a cuadros; las gemas son opcionales.',
    spawn: { x: startX + 1.5, y: 1.05, z: 0 },
    platforms, ramps, hazards, movingPlatforms, trampolines, conveyors, fans, hammers, obstacles, traps, restZones, gems, checkpoints,
    goal: { position: { x: finalPlatform.position.x + finalPlatform.size.x / 2 - 1.15, y: finalPlatform.position.y + 1.5, z: 0 } },
    fallResetY: -4.2,
    starCriteria: starCriteriaForLevel(levelIndex),
  };
  assertRouteIntegrity(level, levelIndex, sectionCount, restSections);
  return level;
}

/** 6–8, 9–12, 12–16, then an 18-section finale. */
function sectionCountForLevel(levelIndex: number): number {
  return [6, 7, 8, 9, 10, 11, 12, 13, 15, 18][levelIndex] ?? 18;
}

function restSectionsForLevel(levelIndex: number, sectionCount: number): ReadonlySet<number> {
  if (levelIndex <= 2) return new Set([3, sectionCount - 1]);
  if (levelIndex <= 5) return new Set([4, 9, sectionCount - 1].filter((section) => section < sectionCount));
  if (levelIndex === 6) return new Set([5, sectionCount - 1]);
  if (levelIndex === 7) return new Set([4, 8, sectionCount - 1]);
  if (levelIndex === 8) return new Set([4, 9, sectionCount - 1]);
  return new Set([3, 8, 13, sectionCount - 1]);
}

function actEndsForLevel(levelIndex: number, sectionCount: number): readonly number[] {
  if (levelIndex === 9) return [3, 8, 13, sectionCount - 1];
  if (levelIndex >= 7) return [...restSectionsForLevel(levelIndex, sectionCount)];
  return [];
}

function sectionWidthsForLevel(levelIndex: number, sectionCount: number, rests: ReadonlySet<number>, gaps: readonly number[], targetLength: number): number[] {
  const widths = Array.from({ length: sectionCount }, (_, sectionIndex) => rests.has(sectionIndex) ? restWidthForLevel(levelIndex) : sectionWidth(levelIndex, sectionIndex));
  const available = targetLength - START_WIDTH - gaps.reduce((sum, gap) => sum + gap, 0);
  const flexible = widths.map((_, sectionIndex) => sectionIndex).filter((sectionIndex) => !rests.has(sectionIndex));
  const difference = available - widths.reduce((sum, width) => sum + width, 0);
  flexible.forEach((sectionIndex, order) => { widths[sectionIndex] += difference / flexible.length * (order % 2 === 0 ? 1.04 : 0.96); });
  if (widths.some((width, sectionIndex) => !rests.has(sectionIndex) && (width < minimumWidth(levelIndex) || width > maximumWidth(levelIndex)))) throw new Error(`The authored length cannot fit the intended platform widths for level ${levelIndex + 1}.`);
  return widths;
}

/** Main-route platforms narrow only after the first three teaching levels. */
function sectionWidth(levelIndex: number, sectionIndex: number): number {
  const rhythm = ((sectionIndex + levelIndex) % 3 - 1) * 0.1;
  if (levelIndex <= 2) return 3 + rhythm;
  if (levelIndex <= 5) return 2.45 + rhythm;
  return 2 + rhythm;
}

function restWidthForLevel(levelIndex: number): number {
  return levelIndex <= 2 ? 3.5 : levelIndex <= 5 ? 3.45 : 3.6;
}

function minimumWidth(levelIndex: number): number { return levelIndex <= 2 ? 2.8 : levelIndex <= 5 ? 2.2 : 1.7; }
function maximumWidth(levelIndex: number): number { return levelIndex <= 2 ? 3.2 : levelIndex <= 5 ? 2.7 : 2.3; }

/** Alternating readable gaps. The opening gap is deliberately a warm-up. */
function gapForSection(levelIndex: number, sectionIndex: number): number {
  const rhythm = [0, 0.22, -0.1, 0.14][sectionIndex % 4];
  if (levelIndex <= 2) return clamp(1.55 + levelIndex * 0.12 + rhythm, 1.5, 2.1);
  if (levelIndex <= 5) return clamp(2.04 + (levelIndex - 3) * 0.17 + rhythm, 2, 2.8);
  return clamp(2.45 + (levelIndex - 6) * 0.11 + rhythm, 2.5, 3.4);
}

function featureForSection(world: WorldId, levelIndex: number, featured: ObstacleKind | undefined, sectionIndex: number): SectionFeature {
  const feature = featureForObstacle(featured);
  if (world === 'forest' && levelIndex === 7) {
    const sequence: readonly SectionFeature[] = ['moving-wall', 'bounce', 'moving-horizontal', 'spinner', 'moving-wall'];
    return sequence[(sectionIndex + WORLD_OFFSETS[world]) % sequence.length];
  }
  if (world === 'forest' && levelIndex === 8) {
    const sequence: readonly SectionFeature[] = ['moving-wall', 'spinner', 'hammer', 'moving-wall', 'bounce'];
    return sequence[(sectionIndex + WORLD_OFFSETS[world]) % sequence.length];
  }
  if (world === 'forest' && levelIndex === 9) {
    const sequence: readonly SectionFeature[] = ['slope', 'moving-horizontal', 'fan', 'bounce', 'moving-wall', 'hammer', 'spinner', 'hammer', 'spinner', 'moving-horizontal', 'fan', 'bounce', 'moving-wall', 'slope', 'moving-horizontal'];
    return sequence[(sectionIndex + WORLD_OFFSETS[world]) % sequence.length];
  }
  const sequences: readonly (readonly SectionFeature[])[] = [
    ['plain', 'slope', 'steps'],
    [world === 'space' ? 'moving-vertical' : 'moving-horizontal', 'slope', 'plain', 'steps'],
    ['bounce', 'slope', 'moving-horizontal', 'plain'],
    [feature ?? 'slope', 'bounce', 'moving-horizontal', 'slope', 'plain'],
    [feature ?? (world === 'wood' ? 'conveyor' : 'fan'), 'plain', 'bounce', 'moving-horizontal', 'slope'],
    [feature ?? 'moving-horizontal', 'slope', 'bounce', 'plain', 'moving-horizontal'],
    [feature ?? (world === 'forest' ? 'spinner' : 'conveyor'), 'slope', 'moving-horizontal', 'fan', 'bounce'],
    [feature ?? 'moving-wall', 'bounce', 'moving-horizontal', 'conveyor', 'moving-wall'],
    [feature ?? 'moving-wall', 'conveyor', 'hammer', 'moving-wall', 'bounce'],
    ['slope', 'moving-horizontal', 'fan', 'conveyor', 'bounce', 'moving-wall', 'hammer', 'conveyor', 'hammer', 'moving-horizontal', 'fan', 'bounce', 'moving-wall', 'slope', 'moving-horizontal'],
  ];
  const sequence = sequences[levelIndex] ?? sequences[sequences.length - 1];
  return sequence[(sectionIndex + WORLD_OFFSETS[world]) % sequence.length];
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

function addFeature(feature: SectionFeature, section: RouteSection, sectionIndex: number, levelIndex: number, theme: WorldProgressionTheme, collections: Pick<LevelDefinition, 'platforms' | 'ramps' | 'hazards' | 'movingPlatforms' | 'trampolines' | 'conveyors' | 'fans' | 'hammers' | 'obstacles'>): void {
  const id = `${feature}-${sectionIndex + 1}`;
  const direction = levelIndex <= 4 ? 1 : (sectionIndex + levelIndex) % 2 === 0 ? 1 : -1;
  if (feature === 'steps') {
    const stepWidth = Math.min(1.05, section.width / 4.4);
    [-1, 0, 1].forEach((offset, step) => collections.platforms.push({ id: `${id}-${step}`, position: { x: section.center + offset * stepWidth, y: section.surfaceY + 0.14 + step * 0.16, z: 0 }, size: { x: stepWidth, y: 0.28, z: 2.65 }, color: theme.accent }));
  } else if (feature === 'moving-horizontal') {
    const y = Math.max(section.surfaceY + 0.2, 0.1);
    collections.movingPlatforms.push({ id, position: { x: section.gapCenter, y, z: 0 }, from: { x: section.gapCenter - 0.55, y, z: 0 }, to: { x: section.gapCenter + 0.55, y, z: 0 }, size: { x: Math.min(2.1, section.gap + 0.55), y: 0.32, z: 2.35 }, cyclesPerSecond: 0.12 + levelIndex * 0.005 + (sectionIndex % 2) * 0.008, color: theme.accent });
  } else if (feature === 'moving-vertical') {
    const lowY = section.surfaceY + 1.6;
    collections.movingPlatforms.push({ id, position: { x: section.center, y: lowY, z: 0 }, from: { x: section.center, y: lowY, z: 0 }, to: { x: section.center, y: lowY + 1.15, z: 0 }, size: { x: Math.min(2.25, section.width * 0.75), y: 0.24, z: 2.35 }, cyclesPerSecond: 0.1 + levelIndex * 0.005, color: theme.accent });
  } else if (feature === 'bounce') {
    collections.trampolines.push({ id, position: { x: section.center, y: section.surfaceY + 0.16, z: 0 }, size: { x: Math.min(1.8, section.width * 0.62), y: 0.32, z: 2.15 }, launchSpeed: 10.5 + Math.min(levelIndex, 5) * 0.2, color: theme.accent });
  } else if (feature === 'fan') {
    collections.fans.push({ id, position: { x: section.center, y: section.surfaceY + 1.2, z: 0 }, size: { x: Math.min(2.8, section.width * 0.9), y: 2.3, z: 2.55 }, direction: direction > 0 ? 'right' : 'left', impulse: 1.8 + Math.min(levelIndex, 8) * 0.04, maxSpeed: 6.5, lift: 0.3, color: theme.accent });
  } else if (feature === 'conveyor') {
    collections.conveyors.push({ id, position: { x: section.center, y: section.surfaceY + 0.16, z: 0 }, size: { x: Math.min(2.7, section.width * 0.9), y: 0.32, z: 2.3 }, speed: direction * (1.25 + levelIndex * 0.07), maxSpeed: 2.8, color: theme.accent });
  } else if (feature === 'hammer' || feature === 'spinner') {
    collections.hammers.push({ id, position: { x: section.center, y: section.surfaceY + 2.25, z: 0 }, length: 1.55, thickness: 0.34, mode: feature === 'spinner' ? 'spin' : 'swing', cyclesPerSecond: feature === 'spinner' ? 0.115 + levelIndex * 0.003 : 0.16 + levelIndex * 0.005, swingAngle: Math.PI / 2.5, startAngle: -Math.PI / 2 + (sectionIndex % 2 === 0 ? -0.24 : 0.24), color: theme.accent });
  } else if (feature === 'moving-wall') {
    collections.movingPlatforms.push({ id, position: { x: section.center, y: section.surfaceY + 1.15, z: 0 }, from: { x: section.center - 1.05, y: section.surfaceY + 1.15, z: 0 }, to: { x: section.center + 1.05, y: section.surfaceY + 1.15, z: 0 }, size: { x: 0.36, y: 1.75, z: 2.4 }, cyclesPerSecond: 0.13 + levelIndex * 0.004, color: theme.accent });
  } else if (feature === 'spikes') {
    collections.hazards.push({ id, kind: 'spikes', position: { x: section.center, y: section.surfaceY + 0.27, z: 0 }, size: { x: Math.min(1.2, section.width * 0.4), y: 0.55, z: 2.35 } });
  }
  if (feature !== 'plain' && feature !== 'steps') collections.obstacles.push({ id: `cue-${id}`, kind: obstacleForFeature(feature), cue: cueForFeature(feature), position: { x: section.center, y: section.surfaceY + 0.55, z: 0 }, size: { x: Math.min(2.5, section.width * 0.9), y: 1, z: 2.3 }, color: theme.accent });
}

function addGemTrail(section: RouteSection, sectionIndex: number, levelIndex: number, isRest: boolean, feature: SectionFeature, gems: LevelDefinition['gems']): void {
  if (isRest) {
    gems.push({ id: `gem-${sectionIndex + 1}-safe`, position: { x: section.center, y: section.surfaceY + 0.95, z: 0 } });
    return;
  }
  gems.push({ id: `gem-${sectionIndex + 1}-path`, position: { x: section.center, y: section.surfaceY + 1.05, z: 0 } });
  if (levelIndex >= 5 && (feature === 'bounce' || feature === 'moving-horizontal' || sectionIndex % 3 === 0)) gems.push({ id: `gem-${sectionIndex + 1}-optional`, position: { x: section.start + section.width * 0.78, y: section.surfaceY + 2.15, z: 0 } });
}

function addGap(sectionIndex: number, center: number, gap: number, theme: WorldProgressionTheme, hazards: LevelDefinition['hazards'], traps: LevelDefinition['traps']): void {
  hazards.push({ id: `gap-${sectionIndex + 1}`, kind: theme.hazard, position: { x: center, y: -1.15, z: 0 }, size: { x: gap, y: 0.72, z: 2.8 } });
  traps.push({ id: `gap-cue-${sectionIndex + 1}`, kind: 'gap', cue: theme.hazard === 'water' ? 'Agua brillante, espuma y bordes contrastantes marcan el hueco.' : 'El vacío oscuro, la sombra y los bordes iluminados marcan el hueco.', position: { x: center, y: -1.15, z: 0 }, size: { x: gap, y: 0.72, z: 2.8 } });
}

function sectionHeight(world: WorldId, sectionIndex: number, levelIndex: number, previous: number, isRest: boolean, feature: SectionFeature): number {
  if (isRest) return clamp(previous * 0.45, -0.45, 0.2);
  const patterns: Record<WorldId, readonly number[]> = {
    beach: [-0.45, -0.18, 0.08, -0.12, -0.38, 0.02], wood: [-0.45, -0.05, 0.22, 0.22, -0.18, 0.1], space: [-0.35, 0.12, 0.4, 0.02, -0.25, 0.26], forest: [-0.45, -0.15, 0.18, -0.08, 0.26, -0.22],
  };
  const target = patterns[world][(sectionIndex + levelIndex) % patterns[world].length];
  return clamp(feature === 'moving-vertical' ? Math.min(target, 0.05) : target, previous - 0.55, previous + 0.55);
}

function shouldAddCheckpoint(levelIndex: number, sectionIndex: number, sectionCount: number, isRest: boolean, actEnds: readonly number[]): boolean {
  if (!isRest || sectionIndex === sectionCount - 1 || levelIndex <= 2) return false;
  if (levelIndex >= 6) return actEnds.includes(sectionIndex);
  return sectionIndex === 4 || (levelIndex >= 5 && sectionIndex === 9);
}

function starCriteriaForLevel(levelIndex: number): LevelDefinition['starCriteria'] {
  if (levelIndex <= 2) return { majorityGemRatio: 0.65, maxRestartsForThirdStar: 3 };
  if (levelIndex <= 5) return { majorityGemRatio: 0.7, maxRestartsForThirdStar: 4 };
  return { majorityGemRatio: 0.72, maxRestartsForThirdStar: 5 };
}

function finalActDescription(world: WorldId): readonly string[] {
  return {
    beach: ['acto 1: rampa + balsa', 'acto 2: ventilador + salto', 'acto 3: rodillo + muro móvil', 'acto 4: balsa final'],
    wood: ['acto 1: bloques + balsa', 'acto 2: rodillo + rebote', 'acto 3: rodillo + martillo', 'acto 4: muro móvil + llegada'],
    space: ['acto 1: rampa + plataforma flotante', 'acto 2: rebote + muro móvil', 'acto 3: aire + rodillo', 'acto 4: plataforma final'],
    forest: ['acto 1: raíz + tronco móvil', 'acto 2: rebote + muro móvil', 'acto 3: aire + molino', 'acto 4: tronco final'],
  }[world];
}

function assertRouteIntegrity(level: LevelDefinition, levelIndex: number, expectedSections: number, rests: ReadonlySet<number>): void {
  const mainPlatforms = level.platforms.filter(({ id }) => id === 'start' || /^section-\d+$/.test(id));
  if (mainPlatforms.length !== expectedSections + 1) throw new Error(`${level.id} has an unexpected number of route sections.`);
  const span = mainPlatforms[mainPlatforms.length - 1].position.x + mainPlatforms[mainPlatforms.length - 1].size.x / 2 - (mainPlatforms[0].position.x - mainPlatforms[0].size.x / 2);
  if (Math.abs(span - level.approximateLength) > 0.01) throw new Error(`${level.id} physical length does not match approximateLength.`);
  mainPlatforms.slice(1).forEach((definition, index) => {
    if (rests.has(index) && definition.size.x < 3.4) throw new Error(`${level.id} has a narrow rest zone.`);
    if (!rests.has(index) && (definition.size.x < minimumWidth(levelIndex) || definition.size.x > maximumWidth(levelIndex))) throw new Error(`${level.id} platform width is out of its progression band.`);
  });
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
    fan: 'Aspas grandes, flechas de aire y movimiento suave.', conveyor: 'Rodillo rayado que gira lentamente.', hammer: 'Martillo grande que se balancea lentamente.', spinner: 'Brazos redondeados que giran despacio.',
    'moving-wall': 'Muro de color vivo que se aparta y deja una abertura clara.', spikes: 'Pinchos claros y separados, visibles desde la plataforma anterior.',
  }[feature];
}

function cueForTrap(kind: TrapKind): string {
  return {
    gap: 'Bordes y sombra visibles antes de la caída.', 'disappearing-platform': 'La plataforma parpadea en color antes de desaparecer.', 'temporary-door': 'La puerta muestra una luz pulsante mientras está abierta.',
    'switch-platform': 'El interruptor grande tiene el mismo color que la plataforma que activa.', 'chained-obstacles': 'Cada elemento se ve desde una plataforma amplia anterior.',
  }[kind];
}

function clamp(value: number, min: number, max: number): number { return Math.min(max, Math.max(min, value)); }
