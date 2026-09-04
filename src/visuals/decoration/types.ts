import type { ModelAssetId } from '../../assets/catalog';

export interface DecorationPlacement {
  readonly asset: ModelAssetId;
  readonly position: { readonly x: number; readonly y: number; readonly z: number };
  readonly scale: number;
  readonly rotationY?: number;
  readonly rotationZ?: number;
  readonly tint?: string;
  readonly castShadow?: boolean;
}

export function sceneryOffsets(approximateLength: number): readonly number[] {
  const halfLength = approximateLength / 2;
  const step = 55;
  const first = Math.floor((-halfLength - 24) / step) * step;
  const offsets: number[] = [];
  for (let offset = first; offset <= halfLength + 24; offset += step) offsets.push(offset);
  return offsets;
}
