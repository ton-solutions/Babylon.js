import { __decorate } from "tslib";
import { Observable } from "../../Misc/observable";
import { serialize } from "../../Misc/decorators";
import { CameraInputTypes } from "../../Cameras/cameraInputsManager";
import { PointerEventTypes } from "../../Events/pointerEvents";
import { Tools } from "../../Misc/tools";
/**
 * Manage the mouse inputs to control the movement of a free camera.
 * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
 */
export class FreeCameraMouseInput {
    /**
     * Manage the mouse inputs to control the movement of a free camera.
     * @see https://doc.babylonjs.com/how_to/customizing_camera_inputs
     * @param touchEnabled Defines if touch is enabled or not
     */
    constructor(
    /**
     * Define if touch is enabled in the mouse input
     */
    touchEnabled = true) {
        this.touchEnabled = touchEnabled;
        /**
         * Defines the buttons associated with the input to handle camera move.
         */
        this.buttons = [0, 1, 2];
        /**
         * Defines the pointer angular sensibility  along the X and Y axis or how fast is the camera rotating.
         */
        this.angularSensibility = 2000.0;
        this._previousPosition = null;
        /**
         * Observable for when a pointer move event occurs containing the move offset
         */
        this.onPointerMovedObservable = new Observable();
        /**
         * @hidden
         * If the camera should be rotated automatically based on pointer movement
         */
        this._allowCameraRotation = true;
        this._currentActiveButton = -1;
    }
    /**
     * Attach the input controls to a specific dom element to get the input from.
     * @param noPreventDefault Defines whether event caught by the controls should call preventdefault() (https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault)
     */
    attachControl(noPreventDefault) {
        // eslint-disable-next-line prefer-rest-params
        noPreventDefault = Tools.BackCompatCameraNoPreventDefault(arguments);
        const engine = this.camera.getEngine();
        const element = engine.getInputElement();
        if (!this._pointerInput) {
            this._pointerInput = (p) => {
                const evt = p.event;
                const isTouch = evt.pointerType === "touch";
                if (engine.isInVRExclusivePointerMode) {
                    return;
                }
                if (!this.touchEnabled && isTouch) {
                    return;
                }
                if (p.type !== PointerEventTypes.POINTERMOVE && this.buttons.indexOf(evt.button) === -1) {
                    return;
                }
                const srcElement = (evt.srcElement || evt.target);
                if (p.type === PointerEventTypes.POINTERDOWN && (this._currentActiveButton === -1 || isTouch)) {
                    try {
                        srcElement === null || srcElement === void 0 ? void 0 : srcElement.setPointerCapture(evt.pointerId);
                    }
                    catch (e) {
                        //Nothing to do with the error. Execution will continue.
                    }
                    if (this._currentActiveButton === -1) {
                        this._currentActiveButton = evt.button;
                    }
                    this._previousPosition = {
                        x: evt.clientX,
                        y: evt.clientY,
                    };
                    if (!noPreventDefault) {
                        evt.preventDefault();
                        element && element.focus();
                    }
                    // This is required to move while pointer button is down
                    if (engine.isPointerLock && this._onMouseMove) {
                        this._onMouseMove(p.event);
                    }
                }
                else if (p.type === PointerEventTypes.POINTERUP && (this._currentActiveButton === evt.button || isTouch)) {
                    try {
                        srcElement === null || srcElement === void 0 ? void 0 : srcElement.releasePointerCapture(evt.pointerId);
                    }
                    catch (e) {
                        //Nothing to do with the error.
                    }
                    this._currentActiveButton = -1;
                    this._previousPosition = null;
                    if (!noPreventDefault) {
                        evt.preventDefault();
                    }
                }
                else if (p.type === PointerEventTypes.POINTERMOVE) {
                    if (engine.isPointerLock && this._onMouseMove) {
                        this._onMouseMove(p.event);
                    }
                    else if (this._previousPosition) {
                        let offsetX = evt.clientX - this._previousPosition.x;
                        const offsetY = evt.clientY - this._previousPosition.y;
                        if (this.camera.getScene().useRightHandedSystem) {
                            offsetX *= -1;
                        }
                        if (this.camera.parent && this.camera.parent._getWorldMatrixDeterminant() < 0) {
                            offsetX *= -1;
                        }
                        if (this._allowCameraRotation) {
                            this.camera.cameraRotation.y += offsetX / this.angularSensibility;
                            this.camera.cameraRotation.x += offsetY / this.angularSensibility;
                        }
                        this.onPointerMovedObservable.notifyObservers({ offsetX: offsetX, offsetY: offsetY });
                        this._previousPosition = {
                            x: evt.clientX,
                            y: evt.clientY,
                        };
                        if (!noPreventDefault) {
                            evt.preventDefault();
                        }
                    }
                }
            };
        }
        this._onMouseMove = (evt) => {
            if (!engine.isPointerLock) {
                return;
            }
            if (engine.isInVRExclusivePointerMode) {
                return;
            }
            let offsetX = evt.movementX || evt.mozMovementX || evt.webkitMovementX || evt.msMovementX || 0;
            if (this.camera.getScene().useRightHandedSystem) {
                offsetX *= -1;
            }
            if (this.camera.parent && this.camera.parent._getWorldMatrixDeterminant() < 0) {
                offsetX *= -1;
            }
            this.camera.cameraRotation.y += offsetX / this.angularSensibility;
            const offsetY = evt.movementY || evt.mozMovementY || evt.webkitMovementY || evt.msMovementY || 0;
            this.camera.cameraRotation.x += offsetY / this.angularSensibility;
            this._previousPosition = null;
            if (!noPreventDefault) {
                evt.preventDefault();
            }
        };
        this._observer = this.camera
            .getScene()
            .onPointerObservable.add(this._pointerInput, PointerEventTypes.POINTERDOWN | PointerEventTypes.POINTERUP | PointerEventTypes.POINTERMOVE);
        if (element) {
            this._contextMenuBind = this.onContextMenu.bind(this);
            element.addEventListener("contextmenu", this._contextMenuBind, false); // TODO: We need to figure out how to handle this for Native
        }
    }
    /**
     * Called on JS contextmenu event.
     * Override this method to provide functionality.
     * @param evt
     */
    onContextMenu(evt) {
        evt.preventDefault();
    }
    /**
     * Detach the current controls from the specified dom element.
     */
    detachControl() {
        if (this._observer) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            if (this._contextMenuBind) {
                const engine = this.camera.getEngine();
                const element = engine.getInputElement();
                element && element.removeEventListener("contextmenu", this._contextMenuBind);
            }
            if (this.onPointerMovedObservable) {
                this.onPointerMovedObservable.clear();
            }
            this._observer = null;
            this._onMouseMove = null;
            this._previousPosition = null;
        }
        this._currentActiveButton = -1;
    }
    /**
     * Gets the class name of the current input.
     * @returns the class name
     */
    getClassName() {
        return "FreeCameraMouseInput";
    }
    /**
     * Get the friendly name associated with the input class.
     * @returns the input friendly name
     */
    getSimpleName() {
        return "mouse";
    }
}
__decorate([
    serialize()
], FreeCameraMouseInput.prototype, "buttons", void 0);
__decorate([
    serialize()
], FreeCameraMouseInput.prototype, "angularSensibility", void 0);
CameraInputTypes["FreeCameraMouseInput"] = FreeCameraMouseInput;
//# sourceMappingURL=freeCameraMouseInput.js.map