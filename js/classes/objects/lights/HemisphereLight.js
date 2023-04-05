import * as THREE from "three";

export default class HemisphereLight {
    constructor() {
        this.object = this.createLight();
    }

    createLight() {
        const light = new THREE.HemisphereLight(0xffffff, 0x444444);
        light.position.set(0, 200, 0);

        return light;
    }
}
