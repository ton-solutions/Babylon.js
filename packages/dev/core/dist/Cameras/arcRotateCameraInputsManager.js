import { ArcRotateCameraPointersInput } from "../Cameras/Inputs/arcRotateCameraPointersInput";
import { ArcRotateCameraKeyboardMoveInput } from "../Cameras/Inputs/arcRotateCameraKeyboardMoveInput";
import { ArcRotateCameraMouseWheelInput } from "../Cameras/Inputs/arcRotateCameraMouseWheelInput";
import { CameraInputsManager } from "../Cameras/cameraInputsManager";
/**
 * Default Inputs manager for the ArcRotateCamera.
 * It groups all the default supported inputs for ease of use.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
export class ArcRotateCameraInputsManager extends CameraInputsManager {
    /**
     * Instantiates a new ArcRotateCameraInputsManager.
     * @param camera Defines the camera the inputs belong to
     */
    constructor(camera) {
        super(camera);
    }
    /**
     * Add mouse wheel input support to the input manager.
     * @returns the current input manager
     */
    addMouseWheel() {
        this.add(new ArcRotateCameraMouseWheelInput());
        return this;
    }
    /**
     * Add pointers input support to the input manager.
     * @returns the current input manager
     */
    addPointers() {
        this.add(new ArcRotateCameraPointersInput());
        return this;
    }
    /**
     * Add keyboard input support to the input manager.
     * @returns the current input manager
     */
    addKeyboard() {
        this.add(new ArcRotateCameraKeyboardMoveInput());
        return this;
    }
}
//# sourceMappingURL=arcRotateCameraInputsManager.js.map