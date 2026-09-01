import { createWorldProgression, type LevelBeat } from './createWorldProgression';

const BEACH_BEATS: readonly LevelBeat[] = [
  { slug: 'dunas', name: 'Dunas suaves', lesson: 'Sube y baja por rampas', length: 28, difficulty: 1, newTrap: 'rampas suaves', mechanics: ['rodar', 'rampas'], reason: 'Introduce el recorrido sin peligro.' },
  { slug: 'bahia', name: 'Bahía de balsas', lesson: 'Cruza un hueco con una balsa móvil', length: 40, difficulty: 1, newTrap: 'plataforma móvil', mechanics: ['rampa', 'agua', 'balsa lateral'], reason: 'Añade un cruce móvil claramente visible.' },
  { slug: 'conchas', name: 'Conchas saltarinas', lesson: 'Aterriza en una zona de rebote', length: 52, difficulty: 2, newTrap: 'zona de rebote', obstacleKind: 'bounce-zone', mechanics: ['balsas', 'rebote', 'salto'], reason: 'Exige un salto tras un aterrizaje seguro.' },
  { slug: 'marea', name: 'Marea inclinada', lesson: 'Cruza bloques inclinados', length: 66, difficulty: 2, newTrap: 'bloque inclinable', obstacleKind: 'tilting-block', mechanics: ['pendiente', 'rebote', 'hueco'], reason: 'Añade una ruta amplia y otra alta.' },
  { slug: 'faro', name: 'Faro de espuma', lesson: 'Corrige el salto con la brisa', length: 78, difficulty: 3, newTrap: 'ventilador', obstacleKind: 'fan', mechanics: ['aire', 'balsa lateral', 'salto'], reason: 'Requiere corregir dirección en el aire.' },
  { slug: 'coral', name: 'Cueva de coral', lesson: 'Reconoce un apoyo que parpadea', length: 90, difficulty: 3, newTrap: 'plataforma temporal', trapKind: 'disappearing-platform', mechanics: ['salto', 'plataforma temporal'], reason: 'Presenta el suelo temporal de uno en uno.' },
  { slug: 'muelle', name: 'Muelle bamboleante', lesson: 'Cruza rodillos despacio', length: 104, difficulty: 3, newTrap: 'rodillo', obstacleKind: 'roller', mechanics: ['rodillo', 'aire', 'plataformas'], reason: 'Junta dos riesgos ya conocidos.' },
  { slug: 'olas', name: 'Olas gemelas', lesson: 'Espera el paso entre muros', length: 120, difficulty: 4, newTrap: 'muro móvil', obstacleKind: 'moving-wall', mechanics: ['muro', 'rebote', 'ruta alta'], reason: 'Encadena decisiones en más secciones.' },
  { slug: 'castillos', name: 'Carrera de castillos', lesson: 'Activa el interruptor antes de la puerta', length: 136, difficulty: 4, newTrap: 'puerta temporal', trapKind: 'temporary-door', mechanics: ['interruptor', 'puerta', 'rodillo'], reason: 'Pide observar señales sin reloj visible.' },
  { slug: 'gran-marea', name: 'Gran marea', lesson: 'Combina todo lo aprendido', length: 158, difficulty: 5, newTrap: 'secuencia de marea', trapKind: 'chained-obstacles', mechanics: ['rampas', 'balsas', 'aire', 'rodillos', 'puerta'], reason: 'Final largo con descansos entre tres actos.' },
];

export const BEACH_LEVELS = createWorldProgression('beach', { surface: '#f6ce70', accent: '#eea85f', hazard: 'water', visualTheme: 'Arena dorada, agua turquesa, conchas y coral low-poly.' }, BEACH_BEATS);
