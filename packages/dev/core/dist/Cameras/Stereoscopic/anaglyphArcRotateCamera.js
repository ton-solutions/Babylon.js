import { Camera } from "../../Cameras/camera";
import { ArcRotateCamera } from "../../Cameras/arcRotateCamera";
import { Vector3 } from "../../Maths/math.vector";
import { Node } from "../../node";
import { setStereoscopicAnaglyphRigMode } from "../RigModes/stereoscopicAnaglyphRigMode";
Node.AddNodeConstructor("AnaglyphArcRotateCamera", (name, scene, options) => {
    return () => new AnaglyphArcRotateCamera(name, 0, 0, 1.0, Vector3.Zero(), options.interaxial_distance, scene);
});
/**
 * Camera used to simulate anaglyphic rendering (based on ArcRotateCamera)
 * @see https://doc.babylonjs.com/features/cameras#anaglyph-cameras
 */
export class AnaglyphArcRotateCamera extends ArcRotateCamera {
    /**
     * Creates a new AnaglyphArcRotateCamera
     * @param name defines camera name
     * @param alpha defines alpha angle (in radians)
     * @param beta defines beta angle (in radians)
     * @param radius defines radius
     * @param target defines camera target
     * @param interaxialDistance defines distance between each color axis
     * @param scene defines the hosting scene
     */
    constructor(name, alpha, beta, radius, target, interaxialDistance, scene) {
        super(name, alpha, beta, radius, target, scene);
        this._setRigMode = setStereoscopicAnaglyphRigMode.bind(null, this);
        this.interaxialDistance = interaxialDistance;
        this.setCameraRigMode(Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH, { interaxialDistance: interaxialDistance });
    }
    /**
     * Gets camera class name
     * @returns AnaglyphArcRotateCamera
     */
    getClassName() {
        return "AnaglyphArcRotateCamera";
    }
}
//# sourceMappingURL=anaglyphArcRotateCamera.js.map