import { Matrix } from "../Maths/math.vector";
import { VertexBuffer } from "../Buffers/buffer";
import { Constants } from "../Engines/constants";
import { Texture } from "../Materials/Textures/texture";
import { MultiRenderTarget } from "../Materials/Textures/multiRenderTarget";
import { MaterialHelper } from "../Materials/materialHelper";
import { Color4 } from "../Maths/math.color";
import { _WarnImport } from "../Misc/devTools";
import { Material } from "../Materials/material";
import "../Shaders/geometry.fragment";
import "../Shaders/geometry.vertex";
import { MaterialFlags } from "../Materials/materialFlags";
/**
 * This renderer is helpful to fill one of the render target with a geometry buffer.
 */
export class GeometryBufferRenderer {
    /**
     * Creates a new G Buffer for the scene
     * @param scene The scene the buffer belongs to
     * @param ratio How big is the buffer related to the main canvas.
     */
    constructor(scene, ratio = 1) {
        /**
         * Dictionary used to store the previous transformation matrices of each rendered mesh
         * in order to compute objects velocities when enableVelocity is set to "true"
         * @hidden
         */
        this._previousTransformationMatrices = {};
        /**
         * Dictionary used to store the previous bones transformation matrices of each rendered mesh
         * in order to compute objects velocities when enableVelocity is set to "true"
         * @hidden
         */
        this._previousBonesTransformationMatrices = {};
        /**
         * Array used to store the ignored skinned meshes while computing velocity map (typically used by the motion blur post-process).
         * Avoids computing bones velocities and computes only mesh's velocity itself (position, rotation, scaling).
         */
        this.excludedSkinnedMeshesFromVelocity = [];
        /** Gets or sets a boolean indicating if transparent meshes should be rendered */
        this.renderTransparentMeshes = true;
        this._resizeObserver = null;
        this._enablePosition = false;
        this._enableVelocity = false;
        this._enableReflectivity = false;
        this._positionIndex = -1;
        this._velocityIndex = -1;
        this._reflectivityIndex = -1;
        this._depthIndex = -1;
        this._normalIndex = -1;
        this._linkedWithPrePass = false;
        this._scene = scene;
        this._ratio = ratio;
        this._useUbo = scene.getEngine().supportsUniformBuffers;
        GeometryBufferRenderer._SceneComponentInitialization(this._scene);
        // Render target
        this._createRenderTargets();
    }
    /**
     * @param prePassRenderer
     * @hidden
     * Sets up internal structures to share outputs with PrePassRenderer
     * This method should only be called by the PrePassRenderer itself
     */
    _linkPrePassRenderer(prePassRenderer) {
        this._linkedWithPrePass = true;
        this._prePassRenderer = prePassRenderer;
        if (this._multiRenderTarget) {
            // prevents clearing of the RT since it's done by prepass
            this._multiRenderTarget.onClearObservable.clear();
            this._multiRenderTarget.onClearObservable.add(() => {
                // pass
            });
        }
    }
    /**
     * @hidden
     * Separates internal structures from PrePassRenderer so the geometry buffer can now operate by itself.
     * This method should only be called by the PrePassRenderer itself
     */
    _unlinkPrePassRenderer() {
        this._linkedWithPrePass = false;
        this._createRenderTargets();
    }
    /**
     * @hidden
     * Resets the geometry buffer layout
     */
    _resetLayout() {
        this._enablePosition = false;
        this._enableReflectivity = false;
        this._enableVelocity = false;
        this._attachments = [];
    }
    /**
     * @param geometryBufferType
     * @param index
     * @hidden
     * Replaces a texture in the geometry buffer renderer
     * Useful when linking textures of the prepass renderer
     */
    _forceTextureType(geometryBufferType, index) {
        if (geometryBufferType === GeometryBufferRenderer.POSITION_TEXTURE_TYPE) {
            this._positionIndex = index;
            this._enablePosition = true;
        }
        else if (geometryBufferType === GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE) {
            this._velocityIndex = index;
            this._enableVelocity = true;
        }
        else if (geometryBufferType === GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE) {
            this._reflectivityIndex = index;
            this._enableReflectivity = true;
        }
        else if (geometryBufferType === GeometryBufferRenderer.DEPTH_TEXTURE_TYPE) {
            this._depthIndex = index;
        }
        else if (geometryBufferType === GeometryBufferRenderer.NORMAL_TEXTURE_TYPE) {
            this._normalIndex = index;
        }
    }
    /**
     * @param attachments
     * @hidden
     * Sets texture attachments
     * Useful when linking textures of the prepass renderer
     */
    _setAttachments(attachments) {
        this._attachments = attachments;
    }
    /**
     * @param internalTexture
     * @hidden
     * Replaces the first texture which is hard coded as a depth texture in the geometry buffer
     * Useful when linking textures of the prepass renderer
     */
    _linkInternalTexture(internalTexture) {
        this._multiRenderTarget.setInternalTexture(internalTexture, 0, false);
    }
    /**
     * Gets the render list (meshes to be rendered) used in the G buffer.
     */
    get renderList() {
        return this._multiRenderTarget.renderList;
    }
    /**
     * Set the render list (meshes to be rendered) used in the G buffer.
     */
    set renderList(meshes) {
        this._multiRenderTarget.renderList = meshes;
    }
    /**
     * Gets whether or not G buffer are supported by the running hardware.
     * This requires draw buffer supports
     */
    get isSupported() {
        return this._multiRenderTarget.isSupported;
    }
    /**
     * Returns the index of the given texture type in the G-Buffer textures array
     * @param textureType The texture type constant. For example GeometryBufferRenderer.POSITION_TEXTURE_INDEX
     * @returns the index of the given texture type in the G-Buffer textures array
     */
    getTextureIndex(textureType) {
        switch (textureType) {
            case GeometryBufferRenderer.POSITION_TEXTURE_TYPE:
                return this._positionIndex;
            case GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE:
                return this._velocityIndex;
            case GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE:
                return this._reflectivityIndex;
            default:
                return -1;
        }
    }
    /**
     * Gets a boolean indicating if objects positions are enabled for the G buffer.
     */
    get enablePosition() {
        return this._enablePosition;
    }
    /**
     * Sets whether or not objects positions are enabled for the G buffer.
     */
    set enablePosition(enable) {
        this._enablePosition = enable;
        // PrePass handles index and texture links
        if (!this._linkedWithPrePass) {
            this.dispose();
            this._createRenderTargets();
        }
    }
    /**
     * Gets a boolean indicating if objects velocities are enabled for the G buffer.
     */
    get enableVelocity() {
        return this._enableVelocity;
    }
    /**
     * Sets whether or not objects velocities are enabled for the G buffer.
     */
    set enableVelocity(enable) {
        this._enableVelocity = enable;
        if (!enable) {
            this._previousTransformationMatrices = {};
        }
        if (!this._linkedWithPrePass) {
            this.dispose();
            this._createRenderTargets();
        }
        this._scene.needsPreviousWorldMatrices = enable;
    }
    /**
     * Gets a boolean indicating if objects roughness are enabled in the G buffer.
     */
    get enableReflectivity() {
        return this._enableReflectivity;
    }
    /**
     * Sets whether or not objects roughness are enabled for the G buffer.
     */
    set enableReflectivity(enable) {
        this._enableReflectivity = enable;
        if (!this._linkedWithPrePass) {
            this.dispose();
            this._createRenderTargets();
        }
    }
    /**
     * Gets the scene associated with the buffer.
     */
    get scene() {
        return this._scene;
    }
    /**
     * Gets the ratio used by the buffer during its creation.
     * How big is the buffer related to the main canvas.
     */
    get ratio() {
        return this._ratio;
    }
    /**
     * Checks whether everything is ready to render a submesh to the G buffer.
     * @param subMesh the submesh to check readiness for
     * @param useInstances is the mesh drawn using instance or not
     * @returns true if ready otherwise false
     */
    isReady(subMesh, useInstances) {
        const material = subMesh.getMaterial();
        if (material && material.disableDepthWrite) {
            return false;
        }
        const defines = [];
        const attribs = [VertexBuffer.PositionKind, VertexBuffer.NormalKind];
        const mesh = subMesh.getMesh();
        // Alpha test
        if (material) {
            let needUv = false;
            if (material.needAlphaTesting() && material.getAlphaTestTexture()) {
                defines.push("#define ALPHATEST");
                defines.push(`#define ALPHATEST_UV${material.getAlphaTestTexture().coordinatesIndex + 1}`);
                needUv = true;
            }
            if (material.bumpTexture && MaterialFlags.BumpTextureEnabled) {
                defines.push("#define BUMP");
                defines.push(`#define BUMP_UV${material.bumpTexture.coordinatesIndex + 1}`);
                needUv = true;
            }
            if (this._enableReflectivity) {
                if (material.specularTexture) {
                    defines.push("#define HAS_SPECULAR");
                    defines.push(`#define REFLECTIVITY_UV${material.specularTexture.coordinatesIndex + 1}`);
                    needUv = true;
                }
                else if (material.reflectivityTexture) {
                    defines.push("#define HAS_REFLECTIVITY");
                    defines.push(`#define REFLECTIVITY_UV${material.reflectivityTexture.coordinatesIndex + 1}`);
                    needUv = true;
                }
            }
            if (needUv) {
                defines.push("#define NEED_UV");
                if (mesh.isVerticesDataPresent(VertexBuffer.UVKind)) {
                    attribs.push(VertexBuffer.UVKind);
                    defines.push("#define UV1");
                }
                if (mesh.isVerticesDataPresent(VertexBuffer.UV2Kind)) {
                    attribs.push(VertexBuffer.UV2Kind);
                    defines.push("#define UV2");
                }
            }
        }
        // PrePass
        if (this._linkedWithPrePass) {
            defines.push("#define PREPASS");
            if (this._depthIndex !== -1) {
                defines.push("#define DEPTH_INDEX " + this._depthIndex);
                defines.push("#define PREPASS_DEPTH");
            }
            if (this._normalIndex !== -1) {
                defines.push("#define NORMAL_INDEX " + this._normalIndex);
                defines.push("#define PREPASS_NORMAL");
            }
        }
        // Buffers
        if (this._enablePosition) {
            defines.push("#define POSITION");
            defines.push("#define POSITION_INDEX " + this._positionIndex);
        }
        if (this._enableVelocity) {
            defines.push("#define VELOCITY");
            defines.push("#define VELOCITY_INDEX " + this._velocityIndex);
            if (this.excludedSkinnedMeshesFromVelocity.indexOf(mesh) === -1) {
                defines.push("#define BONES_VELOCITY_ENABLED");
            }
        }
        if (this._enableReflectivity) {
            defines.push("#define REFLECTIVITY");
            defines.push("#define REFLECTIVITY_INDEX " + this._reflectivityIndex);
        }
        // Bones
        if (mesh.useBones && mesh.computeBonesUsingShaders) {
            attribs.push(VertexBuffer.MatricesIndicesKind);
            attribs.push(VertexBuffer.MatricesWeightsKind);
            if (mesh.numBoneInfluencers > 4) {
                attribs.push(VertexBuffer.MatricesIndicesExtraKind);
                attribs.push(VertexBuffer.MatricesWeightsExtraKind);
            }
            defines.push("#define NUM_BONE_INFLUENCERS " + mesh.numBoneInfluencers);
            defines.push("#define BonesPerMesh " + (mesh.skeleton ? mesh.skeleton.bones.length + 1 : 0));
        }
        else {
            defines.push("#define NUM_BONE_INFLUENCERS 0");
        }
        // Morph targets
        const morphTargetManager = mesh.morphTargetManager;
        let numMorphInfluencers = 0;
        if (morphTargetManager) {
            if (morphTargetManager.numInfluencers > 0) {
                numMorphInfluencers = morphTargetManager.numInfluencers;
                defines.push("#define MORPHTARGETS");
                defines.push("#define NUM_MORPH_INFLUENCERS " + numMorphInfluencers);
                if (morphTargetManager.isUsingTextureForTargets) {
                    defines.push("#define MORPHTARGETS_TEXTURE");
                }
                MaterialHelper.PrepareAttributesForMorphTargetsInfluencers(attribs, mesh, numMorphInfluencers);
            }
        }
        // Instances
        if (useInstances) {
            defines.push("#define INSTANCES");
            MaterialHelper.PushAttributesForInstances(attribs, this._enableVelocity);
            if (subMesh.getRenderingMesh().hasThinInstances) {
                defines.push("#define THIN_INSTANCES");
            }
        }
        // Setup textures count
        if (this._linkedWithPrePass) {
            defines.push("#define RENDER_TARGET_COUNT " + this._attachments.length);
        }
        else {
            defines.push("#define RENDER_TARGET_COUNT " + this._multiRenderTarget.textures.length);
        }
        // Get correct effect
        const drawWrapper = subMesh._getDrawWrapper(undefined, true);
        const cachedDefines = drawWrapper.defines;
        const join = defines.join("\n");
        if (cachedDefines !== join) {
            drawWrapper.setEffect(this._scene.getEngine().createEffect("geometry", {
                attributes: attribs,
                uniformsNames: [
                    "world",
                    "mBones",
                    "viewProjection",
                    "diffuseMatrix",
                    "view",
                    "previousWorld",
                    "previousViewProjection",
                    "mPreviousBones",
                    "bumpMatrix",
                    "reflectivityMatrix",
                    "vTangentSpaceParams",
                    "vBumpInfos",
                    "morphTargetInfluences",
                    "morphTargetTextureInfo",
                    "morphTargetTextureIndices",
                ],
                samplers: ["diffuseSampler", "bumpSampler", "reflectivitySampler", "morphTargets"],
                defines: join,
                onCompiled: null,
                fallbacks: null,
                onError: null,
                uniformBuffersNames: ["Scene"],
                indexParameters: { buffersCount: this._multiRenderTarget.textures.length - 1, maxSimultaneousMorphTargets: numMorphInfluencers },
            }, this._scene.getEngine()), join);
        }
        return drawWrapper.effect.isReady();
    }
    /**
     * Gets the current underlying G Buffer.
     * @returns the buffer
     */
    getGBuffer() {
        return this._multiRenderTarget;
    }
    /**
     * Gets the number of samples used to render the buffer (anti aliasing).
     */
    get samples() {
        return this._multiRenderTarget.samples;
    }
    /**
     * Sets the number of samples used to render the buffer (anti aliasing).
     */
    set samples(value) {
        this._multiRenderTarget.samples = value;
    }
    /**
     * Disposes the renderer and frees up associated resources.
     */
    dispose() {
        if (this._resizeObserver) {
            const engine = this._scene.getEngine();
            engine.onResizeObservable.remove(this._resizeObserver);
            this._resizeObserver = null;
        }
        this.getGBuffer().dispose();
    }
    _assignRenderTargetIndices() {
        const textureNames = [];
        let count = 2;
        textureNames.push("gBuffer_Depth", "gBuffer_Normal");
        if (this._enablePosition) {
            this._positionIndex = count;
            count++;
            textureNames.push("gBuffer_Position");
        }
        if (this._enableVelocity) {
            this._velocityIndex = count;
            count++;
            textureNames.push("gBuffer_Velocity");
        }
        if (this._enableReflectivity) {
            this._reflectivityIndex = count;
            count++;
            textureNames.push("gBuffer_Reflectivity");
        }
        return [count, textureNames];
    }
    _createRenderTargets() {
        const engine = this._scene.getEngine();
        const [count, textureNames] = this._assignRenderTargetIndices();
        let type = Constants.TEXTURETYPE_UNSIGNED_BYTE;
        if (engine._caps.textureFloat && engine._caps.textureFloatLinearFiltering) {
            type = Constants.TEXTURETYPE_FLOAT;
        }
        else if (engine._caps.textureHalfFloat && engine._caps.textureHalfFloatLinearFiltering) {
            type = Constants.TEXTURETYPE_HALF_FLOAT;
        }
        this._multiRenderTarget = new MultiRenderTarget("gBuffer", { width: engine.getRenderWidth() * this._ratio, height: engine.getRenderHeight() * this._ratio }, count, this._scene, { generateMipMaps: false, generateDepthTexture: true, defaultType: type }, textureNames.concat("gBuffer_DepthBuffer"));
        if (!this.isSupported) {
            return;
        }
        this._multiRenderTarget.wrapU = Texture.CLAMP_ADDRESSMODE;
        this._multiRenderTarget.wrapV = Texture.CLAMP_ADDRESSMODE;
        this._multiRenderTarget.refreshRate = 1;
        this._multiRenderTarget.renderParticles = false;
        this._multiRenderTarget.renderList = null;
        // set default depth value to 1.0 (far away)
        this._multiRenderTarget.onClearObservable.add((engine) => {
            engine.clear(new Color4(0.0, 0.0, 0.0, 0.0), true, true, true);
        });
        this._resizeObserver = engine.onResizeObservable.add(() => {
            if (this._multiRenderTarget) {
                this._multiRenderTarget.resize({ width: engine.getRenderWidth() * this._ratio, height: engine.getRenderHeight() * this._ratio });
            }
        });
        // Custom render function
        const renderSubMesh = (subMesh) => {
            const renderingMesh = subMesh.getRenderingMesh();
            const effectiveMesh = subMesh.getEffectiveMesh();
            const scene = this._scene;
            const engine = scene.getEngine();
            const material = subMesh.getMaterial();
            if (!material) {
                return;
            }
            effectiveMesh._internalAbstractMeshDataInfo._isActiveIntermediate = false;
            // Velocity
            if (this._enableVelocity && !this._previousTransformationMatrices[effectiveMesh.uniqueId]) {
                this._previousTransformationMatrices[effectiveMesh.uniqueId] = {
                    world: Matrix.Identity(),
                    viewProjection: scene.getTransformMatrix(),
                };
                if (renderingMesh.skeleton) {
                    const bonesTransformations = renderingMesh.skeleton.getTransformMatrices(renderingMesh);
                    this._previousBonesTransformationMatrices[renderingMesh.uniqueId] = this._copyBonesTransformationMatrices(bonesTransformations, new Float32Array(bonesTransformations.length));
                }
            }
            // Managing instances
            const batch = renderingMesh._getInstancesRenderList(subMesh._id, !!subMesh.getReplacementMesh());
            if (batch.mustReturn) {
                return;
            }
            const hardwareInstancedRendering = engine.getCaps().instancedArrays && (batch.visibleInstances[subMesh._id] !== null || renderingMesh.hasThinInstances);
            const world = effectiveMesh.getWorldMatrix();
            if (this.isReady(subMesh, hardwareInstancedRendering)) {
                const drawWrapper = subMesh._getDrawWrapper();
                if (!drawWrapper) {
                    return;
                }
                const effect = drawWrapper.effect;
                engine.enableEffect(drawWrapper);
                if (!hardwareInstancedRendering) {
                    renderingMesh._bind(subMesh, effect, material.fillMode);
                }
                if (!this._useUbo) {
                    effect.setMatrix("viewProjection", scene.getTransformMatrix());
                    effect.setMatrix("view", scene.getViewMatrix());
                }
                else {
                    MaterialHelper.BindSceneUniformBuffer(effect, this._scene.getSceneUniformBuffer());
                    this._scene.finalizeSceneUbo();
                }
                if (material) {
                    let sideOrientation;
                    const instanceDataStorage = renderingMesh._instanceDataStorage;
                    if (!instanceDataStorage.isFrozen && (material.backFaceCulling || renderingMesh.overrideMaterialSideOrientation !== null)) {
                        const mainDeterminant = effectiveMesh._getWorldMatrixDeterminant();
                        sideOrientation = renderingMesh.overrideMaterialSideOrientation;
                        if (sideOrientation === null) {
                            sideOrientation = material.sideOrientation;
                        }
                        if (mainDeterminant < 0) {
                            sideOrientation = sideOrientation === Material.ClockWiseSideOrientation ? Material.CounterClockWiseSideOrientation : Material.ClockWiseSideOrientation;
                        }
                    }
                    else {
                        sideOrientation = instanceDataStorage.sideOrientation;
                    }
                    material._preBind(drawWrapper, sideOrientation);
                    // Alpha test
                    if (material.needAlphaTesting()) {
                        const alphaTexture = material.getAlphaTestTexture();
                        if (alphaTexture) {
                            effect.setTexture("diffuseSampler", alphaTexture);
                            effect.setMatrix("diffuseMatrix", alphaTexture.getTextureMatrix());
                        }
                    }
                    // Bump
                    if (material.bumpTexture && scene.getEngine().getCaps().standardDerivatives && MaterialFlags.BumpTextureEnabled) {
                        effect.setFloat3("vBumpInfos", material.bumpTexture.coordinatesIndex, 1.0 / material.bumpTexture.level, material.parallaxScaleBias);
                        effect.setMatrix("bumpMatrix", material.bumpTexture.getTextureMatrix());
                        effect.setTexture("bumpSampler", material.bumpTexture);
                        effect.setFloat2("vTangentSpaceParams", material.invertNormalMapX ? -1.0 : 1.0, material.invertNormalMapY ? -1.0 : 1.0);
                    }
                    // Roughness
                    if (this._enableReflectivity) {
                        if (material.specularTexture) {
                            effect.setMatrix("reflectivityMatrix", material.specularTexture.getTextureMatrix());
                            effect.setTexture("reflectivitySampler", material.specularTexture);
                        }
                        else if (material.reflectivityTexture) {
                            effect.setMatrix("reflectivityMatrix", material.reflectivityTexture.getTextureMatrix());
                            effect.setTexture("reflectivitySampler", material.reflectivityTexture);
                        }
                    }
                }
                // Bones
                if (renderingMesh.useBones && renderingMesh.computeBonesUsingShaders && renderingMesh.skeleton) {
                    effect.setMatrices("mBones", renderingMesh.skeleton.getTransformMatrices(renderingMesh));
                    if (this._enableVelocity) {
                        effect.setMatrices("mPreviousBones", this._previousBonesTransformationMatrices[renderingMesh.uniqueId]);
                    }
                }
                // Morph targets
                MaterialHelper.BindMorphTargetParameters(renderingMesh, effect);
                if (renderingMesh.morphTargetManager && renderingMesh.morphTargetManager.isUsingTextureForTargets) {
                    renderingMesh.morphTargetManager._bind(effect);
                }
                // Velocity
                if (this._enableVelocity) {
                    effect.setMatrix("previousWorld", this._previousTransformationMatrices[effectiveMesh.uniqueId].world);
                    effect.setMatrix("previousViewProjection", this._previousTransformationMatrices[effectiveMesh.uniqueId].viewProjection);
                }
                if (hardwareInstancedRendering && renderingMesh.hasThinInstances) {
                    effect.setMatrix("world", world);
                }
                // Draw
                renderingMesh._processRendering(effectiveMesh, subMesh, effect, material.fillMode, batch, hardwareInstancedRendering, (isInstance, w) => {
                    if (!isInstance) {
                        effect.setMatrix("world", w);
                    }
                });
            }
            // Velocity
            if (this._enableVelocity) {
                this._previousTransformationMatrices[effectiveMesh.uniqueId].world = world.clone();
                this._previousTransformationMatrices[effectiveMesh.uniqueId].viewProjection = this._scene.getTransformMatrix().clone();
                if (renderingMesh.skeleton) {
                    this._copyBonesTransformationMatrices(renderingMesh.skeleton.getTransformMatrices(renderingMesh), this._previousBonesTransformationMatrices[effectiveMesh.uniqueId]);
                }
            }
        };
        this._multiRenderTarget.customIsReadyFunction = (mesh, refreshRate) => {
            if (!mesh.isReady(false)) {
                return false;
            }
            if (refreshRate === 0 && mesh.subMeshes) {
                // full check: check that the effects are ready
                for (let i = 0; i < mesh.subMeshes.length; ++i) {
                    const subMesh = mesh.subMeshes[i];
                    const material = subMesh.getMaterial();
                    const renderingMesh = subMesh.getRenderingMesh();
                    if (!material) {
                        continue;
                    }
                    const batch = renderingMesh._getInstancesRenderList(subMesh._id, !!subMesh.getReplacementMesh());
                    const hardwareInstancedRendering = engine.getCaps().instancedArrays && (batch.visibleInstances[subMesh._id] !== null || renderingMesh.hasThinInstances);
                    if (!this.isReady(subMesh, hardwareInstancedRendering)) {
                        return false;
                    }
                }
            }
            return true;
        };
        this._multiRenderTarget.customRenderFunction = (opaqueSubMeshes, alphaTestSubMeshes, transparentSubMeshes, depthOnlySubMeshes) => {
            let index;
            if (this._linkedWithPrePass) {
                if (!this._prePassRenderer.enabled) {
                    return;
                }
                this._scene.getEngine().bindAttachments(this._attachments);
            }
            if (depthOnlySubMeshes.length) {
                engine.setColorWrite(false);
                for (index = 0; index < depthOnlySubMeshes.length; index++) {
                    renderSubMesh(depthOnlySubMeshes.data[index]);
                }
                engine.setColorWrite(true);
            }
            for (index = 0; index < opaqueSubMeshes.length; index++) {
                renderSubMesh(opaqueSubMeshes.data[index]);
            }
            engine.setDepthWrite(false);
            for (index = 0; index < alphaTestSubMeshes.length; index++) {
                renderSubMesh(alphaTestSubMeshes.data[index]);
            }
            if (this.renderTransparentMeshes) {
                for (index = 0; index < transparentSubMeshes.length; index++) {
                    renderSubMesh(transparentSubMeshes.data[index]);
                }
            }
            engine.setDepthWrite(true);
        };
    }
    // Copies the bones transformation matrices into the target array and returns the target's reference
    _copyBonesTransformationMatrices(source, target) {
        for (let i = 0; i < source.length; i++) {
            target[i] = source[i];
        }
        return target;
    }
}
/**
 * Constant used to retrieve the depth texture index in the G-Buffer textures array
 * using getIndex(GeometryBufferRenderer.DEPTH_TEXTURE_INDEX)
 */
GeometryBufferRenderer.DEPTH_TEXTURE_TYPE = 0;
/**
 * Constant used to retrieve the normal texture index in the G-Buffer textures array
 * using getIndex(GeometryBufferRenderer.NORMAL_TEXTURE_INDEX)
 */
GeometryBufferRenderer.NORMAL_TEXTURE_TYPE = 1;
/**
 * Constant used to retrieve the position texture index in the G-Buffer textures array
 * using getIndex(GeometryBufferRenderer.POSITION_TEXTURE_INDEX)
 */
GeometryBufferRenderer.POSITION_TEXTURE_TYPE = 2;
/**
 * Constant used to retrieve the velocity texture index in the G-Buffer textures array
 * using getIndex(GeometryBufferRenderer.VELOCITY_TEXTURE_INDEX)
 */
GeometryBufferRenderer.VELOCITY_TEXTURE_TYPE = 3;
/**
 * Constant used to retrieve the reflectivity texture index in the G-Buffer textures array
 * using the getIndex(GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE)
 */
GeometryBufferRenderer.REFLECTIVITY_TEXTURE_TYPE = 4;
/**
 * @param _
 * @hidden
 */
GeometryBufferRenderer._SceneComponentInitialization = (_) => {
    throw _WarnImport("GeometryBufferRendererSceneComponent");
};
//# sourceMappingURL=geometryBufferRenderer.js.map