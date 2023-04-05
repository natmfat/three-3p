import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class Stage {
    type = "collider";

    constructor(position = [0, 0, 0]) {
        this.object = this.createStage(position);
        this.cannon = this.addPhysics();
    }

    createStage(position) {
        this.geometry = new THREE.BoxGeometry(1000, 50, 1000);
        this.material = new THREE.MeshBasicMaterial({
            color: 0x222222,
            wireframe: false,
        });

        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.position.set(...position);
        // mesh.receiveShadow = true
        // mesh.castShadow = true

        return mesh;
    }

    addPhysics() {
        const { width, height, depth } = this.geometry.parameters;

        const cube = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(
                new CANNON.Vec3(width / 2, height / 2, depth / 2)
            ),
        });
        cube.position.copy(this.object.position);

        return cube;
    }

    update() {
        this.object.position.copy(this.cannon.position);
        this.object.quaternion.copy(this.cannon.quaternion);
    }
}
