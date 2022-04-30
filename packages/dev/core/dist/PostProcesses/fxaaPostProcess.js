import { Texture } from "../Materials/Textures/texture";
import { PostProcess } from "./postProcess";
import { Constants } from "../Engines/constants";
import "../Shaders/fxaa.fragment";
import "../Shaders/fxaa.vertex";
import { RegisterClass } from "../Misc/typeStore";
import { SerializationHelper } from "../Misc/decorators";
/**
 * Fxaa post process
 * @see https://doc.babylonjs.com/how_to/how_to_use_postprocesses#fxaa
 */
export class FxaaPostProcess extends PostProcess {
    /**
     * Gets a string identifying the name of the class
     * @returns "FxaaPostProcess" string
     */
    getClassName() {
        return "FxaaPostProcess";
    }
    constructor(name, options, camera = null, samplingMode, engine, reusable, textureType = Constants.TEXTURETYPE_UNSIGNED_INT) {
        super(name, "fxaa", ["texelSize"], null, options, camera, samplingMode || Texture.BILINEAR_SAMPLINGMODE, engine, reusable, null, textureType, "fxaa", undefined, true);
        const defines = this._getDefines();
        this.updateEffect(defines);
        this.onApplyObservable.add((effect) => {
            const texelSize = this.texelSize;
            effect.setFloat2("texelSize", texelSize.x, texelSize.y);
        });
    }
    _getDefines() {
        const engine = this.getEngine();
        if (!engine) {
            return null;
        }
        const glInfo = engine.getGlInfo();
        if (glInfo && glInfo.renderer && glInfo.renderer.toLowerCase().indexOf("mali") > -1) {
            return "#define MALI 1\n";
        }
        return null;
    }
    /**
     * @param parsedPostProcess
     * @param targetCamera
     * @param scene
     * @param rootUrl
     * @hidden
     */
    static _Parse(parsedPostProcess, targetCamera, scene, rootUrl) {
        return SerializationHelper.Parse(() => {
            return new FxaaPostProcess(parsedPostProcess.name, parsedPostProcess.options, targetCamera, parsedPostProcess.renderTargetSamplingMode, scene.getEngine(), parsedPostProcess.reusable);
        }, parsedPostProcess, scene, rootUrl);
    }
}
RegisterClass("BABYLON.FxaaPostProcess", FxaaPostProcess);
//# sourceMappingURL=fxaaPostProcess.js.map