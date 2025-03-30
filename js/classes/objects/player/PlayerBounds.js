import * as CANNON from "cannon-es";
import * as THREE from "three";

export default class PlayerBounds {
  constructor() {
    this.object = this.createBounds();
    this.cannon = this.addPhysics();
    this.jump = false;

    this.addEventListeners();
  }

  get spawnHeight() {
    return this.geometry.parameters.radius;
  }

  addEventListeners() {
    document.addEventListener("keypress", (e) => {
      if (e.key == "r") {
        this.cannon.position.set(0, this.spawnHeight + 200, 0);
        this.object.position.copy(this.cannon.position);
        this.player.object.position.copy(this.object.position);
      }
    });
  }

  createBounds(wireframe) {
    this.geometry = new THREE.SphereGeometry(175 / 2, 50, 50); //.BoxGeometry(50, 175, 50)
    this.material = wireframe
      ? new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true })
      : new THREE.MeshBasicMaterial({
          color: 0x222222,
          opacity: 0,
          transparent: true,
        });

    const bounds = new THREE.Mesh(this.geometry, this.material);
    bounds.position.y = this.spawnHeight + 200;
    return bounds;
  }

  addPhysics() {
    // const {width, height, depth} = this.geometry.parameters

    const cube = new CANNON.Body({
      mass: 75,
      linearDamping: 0.5,
      angularDamping: 1.0,
      shape: new CANNON.Sphere(175 / 2), // new CANNON.Sphere(Math.max(width / 2, height / 2, depth / 2))
      // new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
    });
    cube.position.copy(this.object.position);

    const contactNormal = new CANNON.Vec3();

    cube.addEventListener("collide", (e) => {
      const contact = e.contact;

      if (contact.bi.id == cube.id) {
        contact.ni.negate(contactNormal);
      } else {
        contactNormal.copy(contact.ni);
      }

      if (contactNormal.dot(new CANNON.Vec3(0, 1, 0)) > 0.5) {
        this.jump = true;
        // this.player.action = "idle"
      }
    });

    return cube;
  }

  update({ player, controls, delta }) {
    let [forward, turn] = controls.state;

    if (!(this.player.currentAnimation == "jump" && !this.jump)) {
      if (forward == 0 && this.jump) {
        this.player.action = "idle";
      } else if (this.player.currentAnimation == "walking" && forward > 0) {
        const elapsed = Math.abs(Date.now() - this.player.animationTime);
        if (elapsed > 1000) {
          this.player.action = "running";
        }
      } else if (forward > 0.3 && this.player.currentAnimation !== "running") {
        this.player.action = "walking";
      } else if (forward < 0.3) {
        this.player.action = "walking_backwards";
      }
    }

    const speed = player.currentAnimation == "running" ? 400 : 150;
    const z = speed * (forward > 0 ? 1 : forward < 0 ? -1 / 3 : 0);

    const angle = (Math.PI / 2) * delta * turn * -1;
    const rotation = new CANNON.Quaternion();
    rotation.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
    this.cannon.quaternion = rotation.mult(this.cannon.quaternion);

    // this.object.translateZ(z * delta)
    // this.cannon.position.x = this.object.position.x // - this.cannon.position.x
    // this.cannon.position.z = this.object.position.z // - this.cannon.position.z
    const local = new CANNON.Vec3(0, 0, z);
    const world = this.cannon.quaternion.vmult(local);

    this.cannon.velocity.x = world.x;
    this.cannon.velocity.z = world.z;

    this.object.position.copy(this.cannon.position);
    this.object.quaternion.copy(this.cannon.quaternion);
  }
}
