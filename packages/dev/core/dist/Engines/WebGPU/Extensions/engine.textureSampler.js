import { WebGPUEngine } from "../../webgpuEngine";
import { Effect } from "../../../Materials/effect";
Effect.prototype.setTextureSampler = function (name, sampler) {
    this._engine.setTextureSampler(name, sampler);
};
WebGPUEngine.prototype.setTextureSampler = function (name, sampler) {
    var _a;
    (_a = this._currentMaterialContext) === null || _a === void 0 ? void 0 : _a.setSampler(name, sampler);
};
//# sourceMappingURL=engine.textureSampler.js.map