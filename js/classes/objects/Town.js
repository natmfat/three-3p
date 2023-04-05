import * as THREE from "three";

export default class Town {
    constructor(assets) {
        const asset = assets["town.fbx"];
        this.object = asset;
    }
}
