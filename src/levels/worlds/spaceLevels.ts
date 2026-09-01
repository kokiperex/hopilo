import { createWorldProgression, type LevelBeat } from './createWorldProgression';

const SPACE_BEATS: readonly LevelBeat[] = [
  { slug: 'orbita', name: 'Órbita tranquila', lesson: 'Rueda entre plataformas flotantes', length: 30, difficulty: 1, newTrap: 'plataforma móvil', mechanics: ['rodar', 'espera'], reason: 'Enseña plataformas móviles sin peligro.' },
  { slug: 'planetario', name: 'Salto planetario', lesson: 'Sube a una plataforma ascendente', length: 44, difficulty: 1, newTrap: 'plataforma ascendente', mechanics: ['rampa', 'salto', 'órbita'], reason: 'Añade cambio suave de altura.' },
  { slug: 'gravedad', name: 'Gravedad suave', lesson: 'Prueba un rebote largo', length: 58, difficulty: 2, newTrap: 'zona de rebote', obstacleKind: 'bounce-zone', mechanics: ['rebote', 'planetas'], reason: 'Introduce salto largo con aterrizaje amplio.' },
  { slug: 'anillos', name: 'Anillos giratorios', lesson: 'Espera un anillo que gira', length: 72, difficulty: 2, newTrap: 'obstáculo giratorio', obstacleKind: 'spinner', mechanics: ['órbita', 'anillo'], reason: 'Pide reconocer un patrón lento.' },
  { slug: 'cometa', name: 'Cometa lateral', lesson: 'Corrige la trayectoria con aire', length: 86, difficulty: 3, newTrap: 'corriente de aire', obstacleKind: 'fan', mechanics: ['aire', 'rebote'], reason: 'Requiere ajuste lateral en espacio abierto.' },
  { slug: 'nubes', name: 'Nubes cósmicas', lesson: 'Reconoce apoyos temporales', length: 100, difficulty: 3, newTrap: 'plataforma temporal', trapKind: 'disappearing-platform', mechanics: ['anillo', 'plataforma temporal'], reason: 'Añade un apoyo que desaparece señalizado.' },
  { slug: 'estacion', name: 'Estación rodante', lesson: 'Cruza rodillos espaciales', length: 116, difficulty: 3, newTrap: 'rodillo', obstacleKind: 'roller', mechanics: ['rodillo', 'plataforma ascendente'], reason: 'Combina equilibrio y salto.' },
  { slug: 'portal', name: 'Portal orbital', lesson: 'Activa un portal de plataforma', length: 132, difficulty: 4, newTrap: 'interruptor', trapKind: 'switch-platform', mechanics: ['interruptor', 'puerta', 'anillo'], reason: 'Da rutas alternativas legibles.' },
  { slug: 'tormenta', name: 'Tormenta de astros', lesson: 'Cruza entre muros móviles', length: 148, difficulty: 4, newTrap: 'muros móviles', obstacleKind: 'moving-wall', mechanics: ['muro', 'aire', 'rodillo'], reason: 'Encadena tres retos con refugios.' },
  { slug: 'viaje', name: 'Viaje estelar', lesson: 'Completa el circuito orbital', length: 172, difficulty: 5, newTrap: 'secuencia orbital', trapKind: 'chained-obstacles', mechanics: ['órbitas', 'aire', 'rodillos', 'portales'], reason: 'Final extenso con cuatro zonas de descanso.' },
];

export const SPACE_LEVELS = createWorldProgression('space', { surface: '#9391e8', accent: '#5f5add', hazard: 'void', visualTheme: 'Violeta, azul profundo, estaciones flotantes y planetas low-poly.' }, SPACE_BEATS);
