export const GAME_CONFIG = {
  camera: {
    viewHeight: 11.25,
    near: 0.1,
    far: 100,
    position: { x: 0, y: 3.5, z: 18 },
    lookAtHeight: 1.5,
    follow: { horizontalOffset: 2.5, smoothing: 4.5 },
  },
  renderer: { maxPixelRatio: 2 },
  world: { clearColor: '#8ed8ff' },
} as const;
