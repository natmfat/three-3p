import * as THREE from "three";

export const prefixFBX = (...paths) =>
    paths.map((path) => `/js/assets/fbx/${path}.fbx`);

export const prefixPNG = (...paths) =>
    paths.map((path) => `/js/assets/images/${path}.png`);

export const randomColor = () => {
    const color = new THREE.Color(0xffffff);
    color.setHex(Math.random() * 0xffffff);
    return color;
};

export const enableApp = () => {
    // todo: block source code
    // todo: load as PWA
};
