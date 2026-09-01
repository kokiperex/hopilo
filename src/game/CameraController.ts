import * as THREE from 'three';
import { GAME_CONFIG } from './config';

export class CameraController {
  private readonly target = new THREE.Vector3();

  public constructor(private readonly camera: THREE.OrthographicCamera) {
    camera.position.set(GAME_CONFIG.camera.position.x, GAME_CONFIG.camera.position.y, GAME_CONFIG.camera.position.z);
  }

  public update(followPosition: THREE.Vector3, deltaSeconds: number): void {
    this.setTarget(followPosition);
    const smoothing = 1 - Math.exp(-GAME_CONFIG.camera.follow.smoothing * deltaSeconds);
    this.camera.position.x += (this.target.x - this.camera.position.x) * smoothing;
    this.camera.lookAt(this.camera.position.x, this.target.y, 0);
  }

  public snapTo(followPosition: THREE.Vector3): void {
    this.setTarget(followPosition);
    this.camera.position.x = this.target.x;
    this.camera.lookAt(this.camera.position.x, this.target.y, 0);
  }

  private setTarget(followPosition: THREE.Vector3): void {
    this.target.set(followPosition.x + GAME_CONFIG.camera.follow.horizontalOffset, GAME_CONFIG.camera.lookAtHeight, 0);
  }
}
