import { createWorldProgression, type LevelBeat } from './createWorldProgression';

const FOREST_BEATS: readonly LevelBeat[] = [
  { slug: 'troncos', name: 'Sendero de troncos', lesson: 'Salta sobre troncos y rocas', length: 37, difficulty: 1, newTrap: 'troncos bajos', mechanics: ['saltos cortos'], reason: 'Familiariza con desniveles estables.' },
  { slug: 'riachuelo', name: 'Riachuelo escondido', lesson: 'Cruza el agua por un tronco móvil', length: 42, difficulty: 1, newTrap: 'tronco móvil', mechanics: ['pendiente', 'agua', 'tronco'], reason: 'Introduce un cruce móvil lento.' },
  { slug: 'setas', name: 'Setas rebotonas', lesson: 'Aterriza en una seta elástica', length: 48, difficulty: 2, newTrap: 'zona de rebote', obstacleKind: 'bounce-zone', mechanics: ['tronco', 'rebote'], reason: 'Añade altura desde una plataforma amplia.' },
  { slug: 'raices', name: 'Raíces inclinadas', lesson: 'Controla el descenso sobre raíces', length: 51, difficulty: 2, newTrap: 'bloque inclinable', obstacleKind: 'tilting-block', mechanics: ['pendiente', 'hueco'], reason: 'Exige controlar el descenso.' },
  { slug: 'brisa', name: 'Brisa entre hojas', lesson: 'Corrige el salto con una ráfaga', length: 57, difficulty: 3, newTrap: 'ventilador', obstacleKind: 'fan', mechanics: ['aire', 'rebote', 'rama'], reason: 'Añade corrección lateral señalizada.' },
  { slug: 'claro', name: 'Claro cambiante', lesson: 'Observa la plataforma que parpadea', length: 64, difficulty: 3, newTrap: 'plataforma temporal', trapKind: 'disappearing-platform', mechanics: ['suelo temporal', 'tronco'], reason: 'Introduce desaparición individual y segura.' },
  { slug: 'molino', name: 'Molino del guardabosque', lesson: 'Espera el giro del molino', length: 67, difficulty: 3, newTrap: 'obstáculo giratorio', obstacleKind: 'spinner', mechanics: ['molino', 'rodillo'], reason: 'Combina ritmo lento y equilibrio.' },
  { slug: 'presa', name: 'Presa de castores', lesson: 'Activa un puente de troncos', length: 72, difficulty: 4, newTrap: 'interruptor', trapKind: 'switch-platform', mechanics: ['interruptor', 'puente', 'agua'], reason: 'Añade causa y efecto con camino alternativo.' },
  { slug: 'enredaderas', name: 'Puerta de enredaderas', lesson: 'Cruza la puerta al momento correcto', length: 85, difficulty: 4, newTrap: 'puerta temporal', trapKind: 'temporary-door', mechanics: ['puerta', 'martillo', 'aire'], reason: 'Encadena señales con checkpoint previo.' },
  { slug: 'gran-sendero', name: 'Gran sendero', lesson: 'Completa el gran camino del bosque', length: 104, difficulty: 5, newTrap: 'secuencia natural', trapKind: 'chained-obstacles', mechanics: ['troncos', 'rebotes', 'aire', 'puertas'], reason: 'Final largo con cuatro actos recuperables.' },
];

export const FOREST_LEVELS = createWorldProgression('forest', { surface: '#8ebc59', accent: '#75523b', hazard: 'water', visualTheme: 'Musgo verde, corteza cálida, rocas y hojas suaves.' }, FOREST_BEATS);
