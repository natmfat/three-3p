import * as THREE from "three";

export default class Cube {
  constructor() {
    this.object = this.createCube();
  }

  createCube() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshPhongMaterial({ color: 0x00aaff });

    return new THREE.Mesh(this.geometry, this.material);
  }

  update() {
    this.object.rotation.x += 0.01;
    this.object.rotation.y += 0.01;
  }
}
