import { WebGPUEngine } from "../../webgpuEngine";
import { WebGPUExternalTexture } from "../webgpuExternalTexture";
import { Effect } from "../../../Materials/effect";
Effect.prototype.setExternalTexture = function (name, texture) {
    this._engine.setExternalTexture(name, texture);
};
WebGPUEngine.prototype.createExternalTexture = function (video) {
    const texture = new WebGPUExternalTexture(video);
    return texture;
};
WebGPUEngine.prototype.setExternalTexture = function (name, texture) {
    if (!texture) {
        this._currentMaterialContext.setTexture(name, null);
        return;
    }
    this._setInternalTexture(name, texture);
};
//# sourceMappingURL=engine.externalTexture.js.map