import { VRDeviceOrientationFreeCamera } from "./vrDeviceOrientationFreeCamera";
import { VRCameraMetrics } from "./vrCameraMetrics";
import { Vector3 } from "../../Maths/math.vector";
import { Node } from "../../node";
import { setVRRigMode } from "../RigModes/vrRigMode";
import "../../Gamepads/gamepadSceneComponent";
Node.AddNodeConstructor("VRDeviceOrientationGamepadCamera", (name, scene) => {
    return () => new VRDeviceOrientationGamepadCamera(name, Vector3.Zero(), scene);
});
/**
 * Camera used to simulate VR rendering (based on VRDeviceOrientationFreeCamera)
 * @see https://doc.babylonjs.com/babylon101/cameras#vr-device-orientation-cameras
 */
export class VRDeviceOrientationGamepadCamera extends VRDeviceOrientationFreeCamera {
    /**
     * Creates a new VRDeviceOrientationGamepadCamera
     * @param name defines camera name
     * @param position defines the start position of the camera
     * @param scene defines the scene the camera belongs to
     * @param compensateDistortion defines if the camera needs to compensate the lens distortion
     * @param vrCameraMetrics defines the vr metrics associated to the camera
     */
    constructor(name, position, scene, compensateDistortion = true, vrCameraMetrics = VRCameraMetrics.GetDefault()) {
        super(name, position, scene, compensateDistortion, vrCameraMetrics);
        this._setRigMode = setVRRigMode.bind(null, this);
        this.inputs.addGamepad();
    }
    /**
     * Gets camera class name
     * @returns VRDeviceOrientationGamepadCamera
     */
    getClassName() {
        return "VRDeviceOrientationGamepadCamera";
    }
}
//# sourceMappingURL=vrDeviceOrientationGamepadCamera.js.map