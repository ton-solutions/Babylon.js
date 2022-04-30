import { Engine } from "../engine";
/**
 * Class used to define an additional view for the engine
 * @see https://doc.babylonjs.com/divingDeeper/scene/multiCanvas
 */
export class EngineView {
}
Object.defineProperty(Engine.prototype, "inputElement", {
    get: function () {
        return this._inputElement;
    },
    set: function (value) {
        var _a;
        if (this._inputElement !== value) {
            this._inputElement = value;
            (_a = this._onEngineViewChanged) === null || _a === void 0 ? void 0 : _a.call(this);
        }
    },
});
Engine.prototype.getInputElement = function () {
    return this.inputElement || this.getRenderingCanvas();
};
Engine.prototype.registerView = function (canvas, camera, clearBeforeCopy) {
    if (!this.views) {
        this.views = [];
    }
    for (const view of this.views) {
        if (view.target === canvas) {
            return view;
        }
    }
    const masterCanvas = this.getRenderingCanvas();
    if (masterCanvas) {
        canvas.width = masterCanvas.width;
        canvas.height = masterCanvas.height;
    }
    const newView = { target: canvas, camera, clearBeforeCopy, enabled: true };
    this.views.push(newView);
    if (camera) {
        camera.onDisposeObservable.add(() => {
            this.unRegisterView(canvas);
        });
    }
    return newView;
};
Engine.prototype.unRegisterView = function (canvas) {
    if (!this.views) {
        return this;
    }
    for (const view of this.views) {
        if (view.target === canvas) {
            const index = this.views.indexOf(view);
            if (index !== -1) {
                this.views.splice(index, 1);
            }
            break;
        }
    }
    return this;
};
Engine.prototype._renderViews = function () {
    if (!this.views) {
        return false;
    }
    const parent = this.getRenderingCanvas();
    if (!parent) {
        return false;
    }
    for (const view of this.views) {
        if (!view.enabled) {
            continue;
        }
        const canvas = view.target;
        const context = canvas.getContext("2d");
        if (!context) {
            continue;
        }
        const camera = view.camera;
        let previewCamera = null;
        let scene = null;
        if (camera) {
            scene = camera.getScene();
            if (scene.activeCameras && scene.activeCameras.length) {
                continue;
            }
            this.activeView = view;
            previewCamera = scene.activeCamera;
            scene.activeCamera = camera;
        }
        if (view.customResize) {
            view.customResize(canvas);
        }
        else {
            // Set sizes
            const width = Math.floor(canvas.clientWidth / this._hardwareScalingLevel);
            const height = Math.floor(canvas.clientHeight / this._hardwareScalingLevel);
            const dimsChanged = width !== canvas.width || parent.width !== canvas.width || height !== canvas.height || parent.height !== canvas.height;
            if (canvas.clientWidth && canvas.clientHeight && dimsChanged) {
                canvas.width = width;
                canvas.height = height;
                this.setSize(width, height);
            }
        }
        if (!parent.width || !parent.height) {
            return false;
        }
        // Render the frame
        this._renderFrame();
        this.flushFramebuffer();
        // Copy to target
        if (view.clearBeforeCopy) {
            context.clearRect(0, 0, parent.width, parent.height);
        }
        context.drawImage(parent, 0, 0);
        // Restore
        if (previewCamera && scene) {
            scene.activeCamera = previewCamera;
        }
    }
    this.activeView = null;
    return true;
};
//# sourceMappingURL=engine.views.js.map