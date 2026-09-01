export const PHYSICS_CONFIG = {
  fixedTimeStep: 1 / 60,
  maxFrameTime: 0.1,
  maxSubSteps: 5,
  gravity: { x: 0, y: -22, z: 0 },
  marble: {
    density: 1.2,
    friction: 0.8,
    restitution: 0.15,
    linearDamping: 0.35,
    angularDamping: 0.25,
    moveAcceleration: 34,
    maxHorizontalSpeed: 6.2,
    jumpSpeed: 9.25,
    coyoteTime: 0.12,
    jumpBufferTime: 0.12,
    respawnCooldown: 0.35,
  },
} as const;
