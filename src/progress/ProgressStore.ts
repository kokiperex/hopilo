export interface LevelProgress {
  stars: number;
  bestGems: number;
}

export interface ProgressData {
  version: 1;
  levels: Record<string, LevelProgress>;
  unlockedLevels: string[];
  gems: number;
  audioEnabled: boolean;
}

export interface LevelResult {
  stars: number;
  gems: number;
}

const STORAGE_KEY = 'hopilo.progress.v1';

function createDefaultProgress(): ProgressData {
  return { version: 1, levels: {}, unlockedLevels: [], gems: 0, audioEnabled: true };
}

/** Small defensive wrapper around localStorage so the game remains playable when it is unavailable. */
export class ProgressStore {
  private data: ProgressData;

  public constructor(private readonly storage: Storage | undefined = safeStorage()) {
    this.data = this.read();
  }

  public get snapshot(): Readonly<ProgressData> {
    return this.data;
  }

  public getLevel(levelId: string): LevelProgress {
    return this.data.levels[levelId] ?? { stars: 0, bestGems: 0 };
  }

  public isUnlocked(levelId: string): boolean {
    return this.data.unlockedLevels.includes(levelId);
  }

  public unlock(levelId: string): void {
    if (this.isUnlocked(levelId)) return;
    this.data.unlockedLevels.push(levelId);
    this.persist();
  }

  public record(levelId: string, result: LevelResult): LevelProgress {
    const previous = this.getLevel(levelId);
    const next = {
      stars: Math.max(previous.stars, clamp(result.stars, 0, 3)),
      bestGems: Math.max(previous.bestGems, Math.max(0, result.gems)),
    };
    this.data.levels[levelId] = next;
    this.data.gems += next.bestGems - previous.bestGems;
    this.persist();
    return next;
  }

  public setAudioEnabled(audioEnabled: boolean): void {
    this.data.audioEnabled = audioEnabled;
    this.persist();
  }

  public reset(): void {
    this.data = createDefaultProgress();
    this.persist();
  }

  private read(): ProgressData {
    try {
      const stored = this.storage?.getItem(STORAGE_KEY);
      if (!stored) return createDefaultProgress();
      const candidate = JSON.parse(stored) as Partial<ProgressData>;
      if (candidate.version !== 1 || typeof candidate.gems !== 'number' || typeof candidate.audioEnabled !== 'boolean' || !candidate.levels || typeof candidate.levels !== 'object') {
        return createDefaultProgress();
      }
      return {
        version: 1,
        gems: Math.max(0, candidate.gems),
        audioEnabled: candidate.audioEnabled,
        unlockedLevels: Array.isArray(candidate.unlockedLevels) ? candidate.unlockedLevels.filter((levelId): levelId is string => typeof levelId === 'string') : [],
        levels: Object.fromEntries(Object.entries(candidate.levels).flatMap(([id, value]) => {
          const item = value as Partial<LevelProgress>;
          return typeof item.stars === 'number' && typeof item.bestGems === 'number'
            ? [[id, { stars: clamp(item.stars, 0, 3), bestGems: Math.max(0, item.bestGems) }]]
            : [];
        })),
      };
    } catch {
      return createDefaultProgress();
    }
  }

  private persist(): void {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Saving can be disabled by the browser; the in-memory session still works.
    }
  }
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
