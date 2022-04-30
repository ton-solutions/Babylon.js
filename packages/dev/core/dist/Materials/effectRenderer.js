import { VertexBuffer } from "../Buffers/buffer";
import { Viewport } from "../Maths/math.viewport";
import { Constants } from "../Engines/constants";
import { Observable } from "../Misc/observable";
import { Effect } from "./effect";
import { DrawWrapper } from "./drawWrapper";
// Prevents ES6 Crash if not imported.
import "../Shaders/postprocess.vertex";
/**
 * Helper class to render one or more effects.
 * You can access the previous rendering in your shader by declaring a sampler named textureSampler
 */
export class EffectRenderer {
    /**
     * Creates an effect renderer
     * @param _engine the engine to use for rendering
     * @param options defines the options of the effect renderer
     */
    constructor(_engine, options = EffectRenderer._DefaultOptions) {
        this._engine = _engine;
        this._fullscreenViewport = new Viewport(0, 0, 1, 1);
        options = Object.assign(Object.assign({}, EffectRenderer._DefaultOptions), options);
        this._vertexBuffers = {
            [VertexBuffer.PositionKind]: new VertexBuffer(_engine, options.positions, VertexBuffer.PositionKind, false, false, 2),
        };
        this._indexBuffer = _engine.createIndexBuffer(options.indices);
        this._onContextRestoredObserver = _engine.onContextRestoredObservable.add(() => {
            this._indexBuffer = _engine.createIndexBuffer(options.indices);
            for (const key in this._vertexBuffers) {
                const vertexBuffer = this._vertexBuffers[key];
                vertexBuffer._rebuild();
            }
        });
    }
    /**
     * Sets the current viewport in normalized coordinates 0-1
     * @param viewport Defines the viewport to set (defaults to 0 0 1 1)
     */
    setViewport(viewport = this._fullscreenViewport) {
        this._engine.setViewport(viewport);
    }
    /**
     * Binds the embedded attributes buffer to the effect.
     * @param effect Defines the effect to bind the attributes for
     */
    bindBuffers(effect) {
        this._engine.bindBuffers(this._vertexBuffers, this._indexBuffer, effect);
    }
    /**
     * Sets the current effect wrapper to use during draw.
     * The effect needs to be ready before calling this api.
     * This also sets the default full screen position attribute.
     * @param effectWrapper Defines the effect to draw with
     */
    applyEffectWrapper(effectWrapper) {
        this._engine.depthCullingState.depthTest = false;
        this._engine.stencilState.stencilTest = false;
        this._engine.enableEffect(effectWrapper._drawWrapper);
        this.bindBuffers(effectWrapper.effect);
        effectWrapper.onApplyObservable.notifyObservers({});
    }
    /**
     * Restores engine states
     */
    restoreStates() {
        this._engine.depthCullingState.depthTest = true;
        this._engine.stencilState.stencilTest = true;
    }
    /**
     * Draws a full screen quad.
     */
    draw() {
        this._engine.drawElementsType(Constants.MATERIAL_TriangleFillMode, 0, 6);
    }
    _isRenderTargetTexture(texture) {
        return texture.renderTarget !== undefined;
    }
    /**
     * renders one or more effects to a specified texture
     * @param effectWrapper the effect to renderer
     * @param outputTexture texture to draw to, if null it will render to the screen.
     */
    render(effectWrapper, outputTexture = null) {
        // Ensure effect is ready
        if (!effectWrapper.effect.isReady()) {
            return;
        }
        // Reset state
        this.setViewport();
        const out = outputTexture === null ? null : this._isRenderTargetTexture(outputTexture) ? outputTexture.renderTarget : outputTexture;
        if (out) {
            this._engine.bindFramebuffer(out);
        }
        this.applyEffectWrapper(effectWrapper);
        this.draw();
        if (out) {
            this._engine.unBindFramebuffer(out);
        }
        this.restoreStates();
    }
    /**
     * Disposes of the effect renderer
     */
    dispose() {
        const vertexBuffer = this._vertexBuffers[VertexBuffer.PositionKind];
        if (vertexBuffer) {
            vertexBuffer.dispose();
            delete this._vertexBuffers[VertexBuffer.PositionKind];
        }
        if (this._indexBuffer) {
            this._engine._releaseBuffer(this._indexBuffer);
        }
        if (this._onContextRestoredObserver) {
            this._engine.onContextRestoredObservable.remove(this._onContextRestoredObserver);
            this._onContextRestoredObserver = null;
        }
    }
}
// Fullscreen quad buffers by default.
EffectRenderer._DefaultOptions = {
    positions: [1, 1, -1, 1, -1, -1, 1, -1],
    indices: [0, 1, 2, 0, 2, 3],
};
/**
 * Wraps an effect to be used for rendering
 */
export class EffectWrapper {
    /**
     * Creates an effect to be renderer
     * @param creationOptions options to create the effect
     */
    constructor(creationOptions) {
        /**
         * Event that is fired right before the effect is drawn (should be used to update uniforms)
         */
        this.onApplyObservable = new Observable();
        let effectCreationOptions;
        const uniformNames = creationOptions.uniformNames || [];
        if (creationOptions.vertexShader) {
            effectCreationOptions = {
                fragmentSource: creationOptions.fragmentShader,
                vertexSource: creationOptions.vertexShader,
                spectorName: creationOptions.name || "effectWrapper",
            };
        }
        else {
            // Default scale to use in post process vertex shader.
            uniformNames.push("scale");
            effectCreationOptions = {
                fragmentSource: creationOptions.fragmentShader,
                vertex: "postprocess",
                spectorName: creationOptions.name || "effectWrapper",
            };
            // Sets the default scale to identity for the post process vertex shader.
            this.onApplyObservable.add(() => {
                this.effect.setFloat2("scale", 1, 1);
            });
        }
        const defines = creationOptions.defines ? creationOptions.defines.join("\n") : "";
        this._drawWrapper = new DrawWrapper(creationOptions.engine);
        if (creationOptions.useShaderStore) {
            effectCreationOptions.fragment = effectCreationOptions.fragmentSource;
            if (!effectCreationOptions.vertex) {
                effectCreationOptions.vertex = effectCreationOptions.vertexSource;
            }
            delete effectCreationOptions.fragmentSource;
            delete effectCreationOptions.vertexSource;
            this.effect = creationOptions.engine.createEffect(effectCreationOptions, creationOptions.attributeNames || ["position"], uniformNames, creationOptions.samplerNames, defines, undefined, creationOptions.onCompiled, undefined, undefined, creationOptions.shaderLanguage);
        }
        else {
            this.effect = new Effect(effectCreationOptions, creationOptions.attributeNames || ["position"], uniformNames, creationOptions.samplerNames, creationOptions.engine, defines, undefined, creationOptions.onCompiled, undefined, undefined, undefined, creationOptions.shaderLanguage);
            this._onContextRestoredObserver = creationOptions.engine.onContextRestoredObservable.add(() => {
                this.effect._pipelineContext = null; // because _prepareEffect will try to dispose this pipeline before recreating it and that would lead to webgl errors
                this.effect._wasPreviouslyReady = false;
                this.effect._prepareEffect();
            });
        }
    }
    /**
     * The underlying effect
     */
    get effect() {
        return this._drawWrapper.effect;
    }
    set effect(effect) {
        this._drawWrapper.effect = effect;
    }
    /**
     * Disposes of the effect wrapper
     */
    dispose() {
        if (this._onContextRestoredObserver) {
            this.effect.getEngine().onContextRestoredObservable.remove(this._onContextRestoredObserver);
            this._onContextRestoredObserver = null;
        }
        this.effect.dispose();
    }
}
//# sourceMappingURL=effectRenderer.js.map