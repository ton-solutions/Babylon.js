import { __decorate } from "tslib";
import { PostProcess } from "./postProcess";
import { ToGammaSpace } from "../Maths/math.constants";
import { Constants } from "../Engines/constants";
import "../Shaders/extractHighlights.fragment";
import { serialize } from "../Misc/decorators";
import { RegisterClass } from "../Misc/typeStore";
/**
 * The extract highlights post process sets all pixels to black except pixels above the specified luminance threshold. Used as the first step for a bloom effect.
 */
export class ExtractHighlightsPostProcess extends PostProcess {
    constructor(name, options, camera, samplingMode, engine, reusable, textureType = Constants.TEXTURETYPE_UNSIGNED_INT, blockCompilation = false) {
        super(name, "extractHighlights", ["threshold", "exposure"], null, options, camera, samplingMode, engine, reusable, null, textureType, undefined, null, blockCompilation);
        /**
         * The luminance threshold, pixels below this value will be set to black.
         */
        this.threshold = 0.9;
        /** @hidden */
        this._exposure = 1;
        /**
         * Post process which has the input texture to be used when performing highlight extraction
         * @hidden
         */
        this._inputPostProcess = null;
        this.onApplyObservable.add((effect) => {
            this.externalTextureSamplerBinding = !!this._inputPostProcess;
            if (this._inputPostProcess) {
                effect.setTextureFromPostProcess("textureSampler", this._inputPostProcess);
            }
            effect.setFloat("threshold", Math.pow(this.threshold, ToGammaSpace));
            effect.setFloat("exposure", this._exposure);
        });
    }
    /**
     * Gets a string identifying the name of the class
     * @returns "ExtractHighlightsPostProcess" string
     */
    getClassName() {
        return "ExtractHighlightsPostProcess";
    }
}
__decorate([
    serialize()
], ExtractHighlightsPostProcess.prototype, "threshold", void 0);
RegisterClass("BABYLON.ExtractHighlightsPostProcess", ExtractHighlightsPostProcess);
//# sourceMappingURL=extractHighlightsPostProcess.js.map