import * as THREE from "three";

export default class Grid {
  constructor() {
    this.object = this.createGrid();
  }

  createGrid() {
    const grid = new THREE.GridHelper(5000, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;

    return grid;
  }
}
