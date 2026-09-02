export const MARBLE_SKIN_IDS = ['blue-glass', 'tire', 'ribbons', 'ember', 'turkiye', 'peru', 'prism-x'] as const;

export type MarbleSkinId = (typeof MARBLE_SKIN_IDS)[number];

export interface MarbleSkinDefinition {
  id: MarbleSkinId;
  name: string;
  description: string;
  previewClass: string;
  hasFace: boolean;
  previewMotif?: 'turkiye';
}

export const DEFAULT_MARBLE_SKIN_ID: MarbleSkinId = 'blue-glass';

/** Product-facing skin catalog. Adding a skin here makes it available to navigation and persistence. */
export const MARBLE_SKINS: readonly MarbleSkinDefinition[] = [
  { id: 'blue-glass', name: 'Azul', description: 'La canica original', previewClass: 'skin-blue-glass', hasFace: false },
  { id: 'tire', name: 'Llanta', description: 'Negra con púas suaves', previewClass: 'skin-tire', hasFace: true },
  { id: 'ribbons', name: 'Arcoíris', description: 'Cintas de muchos colores', previewClass: 'skin-ribbons', hasFace: true },
  { id: 'ember', name: 'Fuego', description: 'Roja y marrón', previewClass: 'skin-ember', hasFace: true },
  { id: 'turkiye', name: 'Turquía', description: 'Media luna y estrella', previewClass: 'skin-turkiye', hasFace: true, previewMotif: 'turkiye' },
  { id: 'peru', name: 'Perú', description: 'Roja, blanca y roja', previewClass: 'skin-peru', hasFace: true },
  { id: 'prism-x', name: 'Súper X', description: 'Una X multicolor', previewClass: 'skin-prism-x', hasFace: true },
];

export function isMarbleSkinId(value: unknown): value is MarbleSkinId {
  return typeof value === 'string' && (MARBLE_SKIN_IDS as readonly string[]).includes(value);
}
