export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

const EMPTY_INPUT: InputState = { left: false, right: false, jump: false };

/** Input is deliberately independent from gameplay actions until the vertical slice. */
export class InputController {
  private readonly pressed = new Set<string>();
  private readonly activePointers = new Map<keyof InputState, Set<number>>();
  private readonly unbindTouchControls: Array<() => void> = [];

  public constructor(private readonly target: Window = window) {
    target.addEventListener('keydown', this.onKeyDown);
    target.addEventListener('keyup', this.onKeyUp);
    target.addEventListener('blur', this.clear);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  public get state(): InputState {
    return {
      left: this.pressed.has('ArrowLeft') || this.pressed.has('KeyA') || this.hasActivePointer('left'),
      right: this.pressed.has('ArrowRight') || this.pressed.has('KeyD') || this.hasActivePointer('right'),
      jump: this.pressed.has('Space') || this.hasActivePointer('jump'),
    };
  }

  public bindTouchControl(button: HTMLButtonElement, action: keyof InputState): void {
    const press = (event: PointerEvent): void => {
      if (event.button !== 0) return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      const pointers = this.activePointers.get(action) ?? new Set<number>();
      pointers.add(event.pointerId);
      this.activePointers.set(action, pointers);
    };
    const release = (event: PointerEvent): void => {
      const pointers = this.activePointers.get(action);
      pointers?.delete(event.pointerId);
      if (pointers?.size === 0) this.activePointers.delete(action);
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    this.unbindTouchControls.push(() => {
      button.removeEventListener('pointerdown', press);
      button.removeEventListener('pointerup', release);
      button.removeEventListener('pointercancel', release);
      button.removeEventListener('lostpointercapture', release);
    });
  }

  public dispose(): void {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
    this.target.removeEventListener('blur', this.clear);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.clear();
    this.unbindTouchControls.forEach((unbind) => unbind());
  }

  public readonly clear = (): void => {
    this.pressed.clear();
    this.activePointers.clear();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (isInteractiveTarget(event.target)) return;
    if (event.code in KEY_TO_ACTION) {
      event.preventDefault();
      this.pressed.add(event.code);
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    if (!(event.code in KEY_TO_ACTION)) return;
    if (!isInteractiveTarget(event.target)) event.preventDefault();
    this.pressed.delete(event.code);
  };

  private readonly onVisibilityChange = (): void => {
    if (document.visibilityState !== 'visible') this.clear();
  };

  private hasActivePointer(action: keyof InputState): boolean {
    return (this.activePointers.get(action)?.size ?? 0) > 0;
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('button, input, textarea, select, [contenteditable="true"]'));
}

const KEY_TO_ACTION: Record<string, keyof InputState> = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  Space: 'jump',
};

export const noInput = (): InputState => EMPTY_INPUT;
