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

/**
 * Turns a short progression brief into level-only data. Each route uses the
 * same friendly grammar: a safe start, a clearly visible gap, a wide recovery
 * platform after demanding beats, and checkpoints in long circuits.
 */
export function createWorldProgression(world: WorldId, theme: WorldProgressionTheme, beats: readonly LevelBeat[]): readonly LevelDefinition[] {
  return beats.map((beat, index) => createLevel(world, theme, beat, index));
}

function createLevel(world: WorldId, theme: WorldProgressionTheme, beat: LevelBeat, index: number): LevelDefinition {
  const sectionCount = index + 2;
  const startX = -beat.length / 2;
  const platformWidth = index < 2 ? 7 : index < 6 ? 6.3 : 5.8;
  const platforms: LevelDefinition['platforms'] = [platform('start', startX + 3.5, -0.45, 7, theme.surface)];
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

  let cursor = startX + 7;
  for (let section = 0; section < sectionCount; section += 1) {
    const gap = section === 0 && index === 0 ? 0.8 : 1.35 + Math.min(index, 5) * 0.12;
    const isRest = section === 0 || (section + 1) % 3 === 0 || section === sectionCount - 1;
    const width = isRest ? platformWidth + 2.2 : platformWidth;
    const height = section % 4 === 1 ? -0.15 : section % 4 === 2 ? 0.18 : -0.45;
    const gapCenter = cursor + gap / 2;
    if (gap > 1) {
      hazards.push({ id: `gap-${section + 1}`, kind: theme.hazard, position: { x: gapCenter, y: -1.1, z: 0 }, size: { x: gap, y: 0.65, z: 2.8 } });
      traps.push({ id: `gap-cue-${section + 1}`, kind: 'gap', cue: theme.hazard === 'water' ? 'Agua brillante y espuma marcan el hueco.' : 'El vacío oscuro y los bordes iluminados marcan el hueco.', position: { x: gapCenter, y: -1.1, z: 0 }, size: { x: gap, y: 0.65, z: 2.8 } });
    }
    cursor += gap;
    const center = cursor + width / 2;
    platforms.push(platform(`section-${section + 1}`, center, height, width, section % 2 === 0 ? theme.surface : theme.accent));
    gems.push({ id: `gem-${section + 1}`, position: { x: center, y: height + 1.35, z: 0 } });
    if (section % 2 === 1) ramps.push({ id: `ramp-${section + 1}`, position: { x: cursor - 1.2, y: height + 0.2, z: 0 }, size: { x: 2.4, y: 0.5, z: 2.8 }, angle: 0.16, color: theme.accent });
    if (isRest) restZones.push({ id: `rest-${section + 1}`, label: section === sectionCount - 1 ? 'Zona segura antes de la meta' : 'Plataforma amplia para recuperar el control', position: { x: center, y: height, z: 0 }, size: { x: width, y: 0.9, z: 2.8 }, color: theme.surface });
    if (index > 0 && section === Math.floor(sectionCount / 2)) {
      checkpoints.push({ id: `checkpoint-${section + 1}`, position: { x: center + width / 2 - 0.8, y: height + 1.35, z: 0 }, respawn: { x: center + width / 2 - 1.1, y: height + 1.7, z: 0 } });
    }
    if (index > 0 && section === 1) {
      movingPlatforms.push({ id: 'guide-platform', position: { x: gapCenter, y: 0.15, z: 0 }, from: { x: gapCenter - 0.45, y: 0.15, z: 0 }, to: { x: gapCenter + 0.45, y: 0.15, z: 0 }, size: { x: 1.8, y: 0.32, z: 2.35 }, cyclesPerSecond: 0.13 + index * 0.008, color: theme.accent });
    }
    cursor += width;
  }

  const lastPlatform = platforms[platforms.length - 1];
  const goalX = lastPlatform.position.x + lastPlatform.size.x / 2 - 1.15;
  if (beat.obstacleKind) {
    const featuredPlatform = platforms[Math.max(1, Math.floor(platforms.length / 2))];
    const surfaceY = featuredPlatform.position.y + featuredPlatform.size.y / 2;
    const featureX = featuredPlatform.position.x;
    obstacles.push({ id: 'featured-obstacle', kind: beat.obstacleKind, cue: cueForObstacle(beat.obstacleKind), position: { x: featureX, y: surfaceY + 0.65, z: 0 }, size: { x: 1.6, y: 1.25, z: 2.2 }, color: theme.accent });
    if (beat.obstacleKind === 'bounce-zone') {
      trampolines.push({ id: 'featured-trampoline', position: { x: featureX, y: surfaceY + 0.22, z: 0 }, size: { x: 1.55, y: 0.44, z: 2.15 }, launchSpeed: 11.5, color: theme.accent });
    } else if (beat.obstacleKind === 'fan') {
      fans.push({ id: 'featured-fan', position: { x: featureX, y: surfaceY + 1.2, z: 0 }, size: { x: 2.4, y: 2.4, z: 2.55 }, direction: 'right', force: 11, lift: 2.8, color: theme.accent });
    } else if (beat.obstacleKind === 'slow-hammer' || beat.obstacleKind === 'spinner') {
      hammers.push({ id: 'featured-hammer', position: { x: featureX, y: surfaceY + 2.15, z: 0 }, length: 1.75, thickness: 0.34, mode: beat.obstacleKind === 'spinner' ? 'spin' : 'swing', cyclesPerSecond: beat.obstacleKind === 'spinner' ? 0.13 : 0.2, swingAngle: Math.PI / 3, color: theme.accent });
    } else if (beat.obstacleKind === 'roller' || beat.obstacleKind === 'slippery-surface') {
      conveyors.push({ id: 'featured-conveyor', position: { x: featureX, y: surfaceY + 0.16, z: 0 }, size: { x: 2.15, y: 0.32, z: 2.3 }, speed: beat.obstacleKind === 'roller' ? -1.8 : 1.4, color: theme.accent });
    } else if (beat.obstacleKind === 'moving-wall') {
      movingPlatforms.push({ id: 'featured-moving-wall', position: { x: featureX, y: surfaceY + 1.1, z: 0 }, from: { x: featureX - 1.15, y: surfaceY + 1.1, z: 0 }, to: { x: featureX + 1.15, y: surfaceY + 1.1, z: 0 }, size: { x: 0.38, y: 2.1, z: 2.4 }, cyclesPerSecond: 0.16, color: theme.accent });
    }
  }
  if (beat.trapKind && beat.trapKind !== 'gap') {
    traps.push({ id: 'featured-trap', kind: beat.trapKind, cue: cueForTrap(beat.trapKind), position: { x: platforms[Math.max(1, platforms.length - 2)].position.x, y: -0.05, z: 0 }, size: { x: 2, y: 0.6, z: 2.6 }, color: theme.accent });
  }

  return {
    id: `${world}-${String(index + 1).padStart(2, '0')}`,
    name: beat.name,
    lesson: beat.lesson,
    world,
    sceneVariant: index < 2 ? 'lesson' : 'adventure',
    difficulty: beat.difficulty,
    approximateLength: beat.length,
    visualTheme: theme.visualTheme,
    mechanicIntroduction: [beat.newTrap, 'zona segura después de cada reto nuevo'],
    challengeCombination: beat.mechanics,
    completionCondition: 'Llega a la bandera a cuadros; las gemas son opcionales.',
    spawn: { x: startX + 1.4, y: 1.05, z: 0 },
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
    starCriteria: { majorityGemRatio: 0.7, maxRestartsForThirdStar: index < 4 ? 3 : 4 },
  };
}

function platform(id: string, x: number, y: number, width: number, color: string): LevelDefinition['platforms'][number] {
  return { id, position: { x, y, z: 0 }, size: { x: width, y: 0.9, z: 2.8 }, color };
}

function cueForObstacle(kind: ObstacleKind): string {
  return {
    roller: 'Rodillo rayado que gira lentamente.', fan: 'Aspas grandes con brillo y movimiento suave.', 'moving-wall': 'Muro de color vivo que se desplaza despacio.', spinner: 'Brazos redondeados que giran despacio.', 'slow-hammer': 'Martillo grande que se balancea lentamente.', 'tilting-block': 'Bloque con flechas de inclinación visibles.', 'slippery-surface': 'Suelo azul brillante con icono de deslizamiento.', 'bounce-zone': 'Almohadilla elástica con franjas luminosas.',
  }[kind];
}

function cueForTrap(kind: TrapKind): string {
  return {
    gap: 'Bordes y sombra visibles antes de la caída.', 'disappearing-platform': 'La plataforma parpadea en color antes de desaparecer.', 'temporary-door': 'La puerta muestra una luz pulsante mientras está abierta.', 'switch-platform': 'El interruptor grande tiene el mismo color que la plataforma que activa.', 'chained-obstacles': 'Cada elemento se ve desde una plataforma amplia anterior.',
  }[kind];
}
