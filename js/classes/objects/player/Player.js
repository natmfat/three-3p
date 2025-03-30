import * as THREE from "three";

export default class Player {
  constructor(assets) {
    const asset = assets["xbot_idle.fbx"];

    const a = (name) => {
      try {
        return assets[name + ".fbx"].animations[0];
      } catch (e) {
        return null;
      }
    };

    this.animations = [
      "running",
      "walking",
      "walking_backwards",
      "jump",
    ].reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: a(cur),
      }),
      { idle: asset.animations[0] },
    );

    this.object = this.createPlayer(asset);
  }

  set action(name = "idle") {
    if (this.currentAnimation !== name) {
      let previous;
      if (this.currentAnimation) {
        previous = this.mixer.clipAction(
          this.animations[this.currentAnimation],
        );
      }

      const action = this.mixer.clipAction(this.animations[name]);
      this.animationTime = Date.now();
      this.currentAnimation = name;

      if (previous !== action && previous) {
        previous.fadeOut(0.2);
      }

      action
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.2)
        .play();
    }
  }

  createPlayer(asset, skin) {
    this.mixer = asset.mixer;
    this.root = asset.mixer.getRoot();

    this.action = "idle";

    if (skin) {
      asset.traverse((child) => {
        if (child.isMesh) {
          child.material.map = skin;
        }
      });
    }

    const group = new THREE.Group();
    group.add(asset);

    return group;
  }

  update() {
    this.object.position.copy(this.bounds.object.position);
    this.object.position.y -= this.bounds.spawnHeight;
    this.object.rotation.copy(this.bounds.object.rotation);
  }
}
