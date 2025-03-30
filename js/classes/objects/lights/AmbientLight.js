import * as THREE from "three";

export default class AmbientLight {
  constructor() {
    this.object = this.createLight();
  }

  createLight() {
    return new THREE.AmbientLight(0x707070, 0.5);
  }
}
