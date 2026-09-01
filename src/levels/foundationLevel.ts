import type { LevelDefinition } from './types';

/** Data for the first vertical-slice circuit. No gameplay code belongs here. */
export const foundationLevel: LevelDefinition = {
  id: 'beach-01-first-bounce',
  name: 'Primer rebote',
  lesson: 'Prueba la canica y una balsa móvil',
  world: 'beach',
  sceneVariant: 'lesson',
  difficulty: 1,
  approximateLength: 30,
  visualTheme: 'Arena clara, agua turquesa y una balsa de madera',
  mechanicIntroduction: ['rampa suave', 'balsa móvil'],
  challengeCombination: ['rampa + agua + balsa'],
  completionCondition: 'Llega a la bandera a cuadros.',
  spawn: { x: -12, y: 1.25, z: 0 },
  platforms: [
    { id: 'start-shore', position: { x: -9.5, y: -0.45, z: 0 }, size: { x: 7, y: 0.9, z: 2.8 }, color: '#f6ce70' },
    { id: 'checkpoint-shore', position: { x: -1.8, y: 0.4, z: 0 }, size: { x: 3.9, y: 1.6, z: 2.8 }, color: '#f6ce70' },
    { id: 'finish-island', position: { x: 8.7, y: -0.1, z: 0 }, size: { x: 9.2, y: 0.9, z: 2.8 }, color: '#f6ce70' },
  ],
  ramps: [
    { id: 'gentle-ramp', position: { x: -5.25, y: 0.15, z: 0 }, size: { x: 3.9, y: 0.7, z: 2.8 }, angle: 0.22, color: '#f6ce70' },
  ],
  hazards: [
    { id: 'deep-water', kind: 'water', position: { x: 3.75, y: -0.35, z: 0 }, size: { x: 2.7, y: 0.6, z: 2.7 } },
  ],
  movingPlatforms: [
    {
      id: 'drifting-raft',
      position: { x: 3.75, y: 1.05, z: 0 },
      size: { x: 2.45, y: 0.35, z: 2.4 },
      from: { x: 2.85, y: 1.05, z: 0 },
      to: { x: 4.65, y: 1.05, z: 0 },
      cyclesPerSecond: 0.22,
      color: '#dc9d52',
    },
  ],
  trampolines: [],
  conveyors: [],
  fans: [],
  hammers: [],
  obstacles: [],
  traps: [{ id: 'water-gap-cue', kind: 'gap', cue: 'El agua azul contrasta con la arena y deja ver el hueco.', position: { x: 3.75, y: -0.35, z: 0 }, size: { x: 2.7, y: 0.6, z: 2.7 } }],
  restZones: [{ id: 'island-rest', label: 'Isla amplia tras la balsa', position: { x: 8.7, y: -0.1, z: 0 }, size: { x: 9.2, y: 0.9, z: 2.8 } }],
  gems: [
    { id: 'ramp-gem', position: { x: -3.8, y: 2.25, z: 0 } },
    { id: 'raft-gem', position: { x: 3.75, y: 2.05, z: 0 } },
  ],
  checkpoints: [
    { id: 'shell-checkpoint', position: { x: 0.15, y: 1.8, z: 0 }, respawn: { x: 0.1, y: 2.05, z: 0 } },
  ],
  goal: { position: { x: 12.3, y: 1.45, z: 0 } },
  fallResetY: -3.5,
};
