import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { LUTCubeLoader } from 'three/examples/jsm/loaders/LUTCubeLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// import { Logger } from './Logger';

export class Utils3D {

    static gltfLoader = new GLTFLoader();
    static rgbeLoader = new RGBELoader();
    static lutCubeLoader = new LUTCubeLoader();
}
