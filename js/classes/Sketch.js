import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as CANNON from "cannon-es";
import * as THREE from "three";

import Joystick from "./Joystick.js";

export default class Sketch {
    step = 1 / 60;
    delta = 0;
    assets = {};
    objects = [];
    clock = new THREE.Clock();

    constructor({
        container = document.body,
        controls,
        preload = [],
        onLoad,
    } = {}) {
        this.container =
            typeof container == "string"
                ? document.querySelector(container)
                : container;
        this.dimensions = {
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
        };

        this.createWorld();
        this.createScene();
        this.createCamera();
        this.createCameras();
        this.createRenderer();

        if (controls) {
            controls.split(",").forEach((control) => {
                this.createControls(control.toLowerCase().trim());
            });
        }

        this.loadAssets(preload.flat(Infinity), onLoad);
        window.addEventListener("resize", this.resize.bind(this));
    }

    loadAssets(preload, onLoad) {
        let assets = [];

        const loaders = {
            fbx: FBXLoader,
            png: THREE.TextureLoader,
        };

        for (const asset of preload) {
            const extension = asset.split(".").pop();
            const name = asset.split("/").pop();
            const loader = new loaders[extension]();

            const promise = new Promise((resolve) => {
                loader.load(asset, (object) => {
                    if (extension == "fbx" && !asset.includes("anim")) {
                        object.mixer = new THREE.AnimationMixer(object);
                        object.name = name;

                        object.traverse((child) => {
                            if (child.isMesh) {
                                child.receiveShadow = false;
                                child.castShadow = true;

                                // child.material.map = null
                            }
                        });
                    }

                    console.log("loaded", name);

                    resolve(object);
                });
            });

            assets.push({ path: asset, promise });
        }

        return Promise.all(assets).then(async () => {
            for (const asset of assets) {
                const { path, promise } = asset;
                const name = path.split("/").pop();
                this.assets[name] = await promise;
            }

            if (typeof onLoad == "function") {
                onLoad(this.assets);
            }
        });
    }

    add(...objects) {
        for (const object of objects) {
            this.objects.push(object);
            this.scene.add(object.object || object);
            if (object.cannon) {
                this.world.addBody(object.cannon);
            }
        }
    }

    resize() {
        this.dimensions = {
            width: this.container.offsetWidth,
            height: this.container.offsetHeight,
        };

        this.camera.aspect = this.aspect;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.dimensions.width, this.dimensions.height);
    }

    createWorld() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.87 * 20, 0);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xa0a0a0);
        this.scene.fog = new THREE.Fog(0xa0a0a0, 700, 4000);
        // this.scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000)
    }

    createCamera() {
        const fov = 45;
        const near = 1;
        const far = 5000;

        this.camera = new THREE.PerspectiveCamera(fov, this.aspect, near, far);
        this.camera.position.set(0, 120, 500);
    }

    createCameras() {
        const createObject = (...args) => {
            const _object = new THREE.Object3D();
            _object.position.set(...args);
            return _object;
        };

        const front = createObject(112, 100, 600);
        const back = createObject(0, 300, -600);
        const wide = createObject(178, 139, 1665);
        const overhead = createObject(0, 400, 0);
        const collect = createObject(40, 82, 94);

        this.cameras = { front, back, wide, overhead, collect };
        this.activeCamera = this.cameras.back;
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.renderer.setSize(this.dimensions.width, this.dimensions.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.container.appendChild(this.renderer.domElement);
    }

    createControls(controls) {
        this.controlType = controls;

        switch (controls) {
            case "joystick":
                this.controls = new Joystick({
                    container: this.container,
                    onJump: () => {
                        if (this.player.bounds.jump) {
                            this.player.bounds.jump = false;
                            this.player.bounds.cannon.velocity.y = 150;
                            this.player.action = "jump";
                        }
                    },
                    // onMove: (state) => {
                    //     if(this.player) {
                    //         let [forward] = state
                    //         // turn *= -1

                    //     }
                    // }
                });
                break;

            case "orbit":
            default:
                this.controls = new OrbitControls(
                    this.camera,
                    this.renderer.domElement
                );
                this.controls.target.set(0, 0, 0);
                this.controls.update();
                break;
        }
    }

    setPlayer(player) {
        this.player = player;
        this.add(player);

        for (const key in this.cameras) {
            this.cameras[key].parent = this.player.object;
        }
    }

    render() {
        this.delta = this.clock.getDelta();
        this.world.step(this.step, this.delta);
        this.renderer.render(this.scene, this.camera);

        for (const object of this.objects) {
            if (typeof object.update == "function") {
                object.update(this);
            }

            if (object.mixer) {
                object.mixer.update(this.delta);
            }
        }

        if (
            this.activeCamera &&
            this.player &&
            this.controlType == "joystick"
        ) {
            this.camera.position.lerp(
                this.activeCamera.getWorldPosition(new THREE.Vector3()),
                0.05
            );
            const position = this.player.object.position.clone();
            position.y += 200;
            this.camera.lookAt(position);
        }

        window.requestAnimationFrame(this.render.bind(this));
    }

    get aspect() {
        return this.dimensions.width / this.dimensions.height;
    }
}
