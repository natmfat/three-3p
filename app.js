import Collider from "./js/classes/objects/colliders/Collider.js";
import Stage from "./js/classes/objects/colliders/Stage.js";
import Floor from "./js/classes/objects/floor/Floor.js";
import FollowLight from "./js/classes/objects/lights/FollowLight.js";
import HemisphereLight from "./js/classes/objects/lights/HemisphereLight.js";
import Player from "./js/classes/objects/player/Player.js";
import PlayerBounds from "./js/classes/objects/player/PlayerBounds.js";
import Sketch from "./js/classes/Sketch.js";
import * as utils from "/js/utils.js";

import "./css/globals.css";
import "./css/index.css";

const sketch = new Sketch({
  container: "#webgl__container",
  controls: "joystick",

  preload: [
    utils.prefixFBX(
      "people/xbot_idle",
      "anims/jump",
      "anims/running",
      "anims/walking",
      "anims/walking_backwards",
      // "anims/turn_left",
      // "anims/turn_right"
    ),
  ],
  onLoad: (assets) => {
    const bounds = new PlayerBounds();
    const player = new Player(assets);

    player.bounds = bounds;
    bounds.player = player;

    sketch.setPlayer(player);
    sketch.add(bounds);
    sketch.render();
  },
});

sketch.add(
  new HemisphereLight(),
  new FollowLight(),
  new Floor(),
  // new Grid()
);

for (let x = -5000; x < 5000; x += 1000) {
  for (let z = -5000; z < 5000; z += 1000) {
    if (x == 0 && z == 0) {
      continue;
    }
    // sketch.add(new Collider([x, 500, z]))
    sketch.add(new Collider([x, 250, z]));
  }
}

sketch.add(new Stage());
