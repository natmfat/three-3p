import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class Floor {
    type = "floor";

    constructor() {
        this.object = this.createFloor();
        this.cannon = this.addPhysics();
    }

    createFloor() {
        this.geometry = new THREE.PlaneBufferGeometry(10000, 10000);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x999999,
            depthWrite: false,
        });

        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;

        return mesh;
    }

    addPhysics() {
        const plane = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
        });
        plane.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

        return plane;
    }
}
