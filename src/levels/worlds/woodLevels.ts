import { createWorldProgression, type LevelBeat } from './createWorldProgression';

const WOOD_BEATS: readonly LevelBeat[] = [
  { slug: 'escalera', name: 'Escalera de bloques', lesson: 'Salta de bloque en bloque', length: 37, difficulty: 1, newTrap: 'bloques bajos', mechanics: ['saltos cortos'], reason: 'Enseña salto sobre terreno estable.' },
  { slug: 'taller', name: 'Taller de juguetes', lesson: 'Cruza una pieza lateral', length: 42, difficulty: 1, newTrap: 'bloque lateral', mechanics: ['rampa', 'bloque móvil'], reason: 'Introduce movimiento horizontal lento.' },
  { slug: 'elastico', name: 'Puente elástico', lesson: 'Usa un rebote para subir', length: 48, difficulty: 2, newTrap: 'zona de rebote', obstacleKind: 'bounce-zone', mechanics: ['puente', 'rebote'], reason: 'Añade altura controlada.' },
  { slug: 'balancin', name: 'Balancín pintado', lesson: 'Cruza un bloque que se inclina', length: 51, difficulty: 2, newTrap: 'bloque inclinable', obstacleKind: 'tilting-block', mechanics: ['balancín', 'hueco'], reason: 'Añade inclinación con base segura.' },
  { slug: 'rodillos', name: 'Rodillos de colores', lesson: 'Avanza sobre rodillos lentos', length: 57, difficulty: 3, newTrap: 'rodillo', obstacleKind: 'roller', mechanics: ['rodillo', 'salto'], reason: 'Requiere ritmo, no velocidad.' },
  { slug: 'martillos', name: 'Pasillo de martillos', lesson: 'Espera un martillo lento', length: 64, difficulty: 3, newTrap: 'martillo lento', obstacleKind: 'slow-hammer', mechanics: ['martillo', 'bloque lateral'], reason: 'Enseña a esperar una abertura.' },
  { slug: 'piezas', name: 'Piezas que faltan', lesson: 'Observa las plataformas temporales', length: 67, difficulty: 3, newTrap: 'plataforma temporal', trapKind: 'disappearing-platform', mechanics: ['martillo', 'suelo temporal'], reason: 'Combina dos señales evidentes.' },
  { slug: 'puentes', name: 'Fábrica de puentes', lesson: 'Activa una plataforma con un interruptor', length: 72, difficulty: 4, newTrap: 'interruptor', trapKind: 'switch-platform', mechanics: ['interruptor', 'plataforma', 'ruta alta'], reason: 'Añade causa y efecto con dos rutas.' },
  { slug: 'juguetero', name: 'Puerta del juguetero', lesson: 'Cruza una puerta de juguete', length: 85, difficulty: 4, newTrap: 'puerta temporal', trapKind: 'temporary-door', mechanics: ['interruptor', 'puerta', 'rodillo'], reason: 'Une tres mecánicas en tramos cortos.' },
  { slug: 'gran-taller', name: 'Gran taller', lesson: 'Termina el circuito de juguetes', length: 104, difficulty: 5, newTrap: 'cadena de juguetes', trapKind: 'chained-obstacles', mechanics: ['bloques', 'rodillos', 'martillos', 'puertas'], reason: 'Final de cuatro tramos con checkpoints.' },
];

export const WOOD_LEVELS = createWorldProgression('wood', { surface: '#dca15c', accent: '#9e5934', hazard: 'void', visualTheme: 'Madera cálida, bloques pintados y puentes de juguete.' }, WOOD_BEATS);
