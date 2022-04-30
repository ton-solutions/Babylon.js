import { Observable } from "../Misc/observable";
import type { Nullable } from "../types";
import type { Scene } from "../scene";
import { InternalTexture } from "../Materials/Textures/internalTexture";
import type { IOfflineProvider } from "../Offline/IOfflineProvider";
import type { ILoadingScreen } from "../Loading/loadingScreen";
import type { WebGLPipelineContext } from "./WebGL/webGLPipelineContext";
import type { IPipelineContext } from "./IPipelineContext";
import type { ICustomAnimationFrameRequester } from "../Misc/customAnimationFrameRequester";
import type { EngineOptions } from "./thinEngine";
import { ThinEngine } from "./thinEngine";
import type { IViewportLike, IColor4Like } from "../Maths/math.like";
import type { RenderTargetTexture } from "../Materials/Textures/renderTargetTexture";
import { PerformanceMonitor } from "../Misc/performanceMonitor";
import type { DataBuffer } from "../Buffers/dataBuffer";
import { PerfCounter } from "../Misc/perfCounter";
import type { RenderTargetWrapper } from "./renderTargetWrapper";
import "./Extensions/engine.alpha";
import "./Extensions/engine.readTexture";
import "./Extensions/engine.dynamicBuffer";
import type { IAudioEngine } from "../Audio/Interfaces/IAudioEngine";
declare type Material = import("../Materials/material").Material;
declare type PostProcess = import("../PostProcesses/postProcess").PostProcess;
/**
 * Defines the interface used by display changed events
 */
export interface IDisplayChangedEventArgs {
    /** Gets the vrDisplay object (if any) */
    vrDisplay: Nullable<any>;
    /** Gets a boolean indicating if webVR is supported */
    vrSupported: boolean;
}
/**
 * Defines the interface used by objects containing a viewport (like a camera)
 */
interface IViewportOwnerLike {
    /**
     * Gets or sets the viewport
     */
    viewport: IViewportLike;
}
/**
 * The engine class is responsible for interfacing with all lower-level APIs such as WebGL and Audio
 */
export declare class Engine extends ThinEngine {
    /** Defines that alpha blending is disabled */
    static readonly ALPHA_DISABLE = 0;
    /** Defines that alpha blending to SRC ALPHA * SRC + DEST */
    static readonly ALPHA_ADD = 1;
    /** Defines that alpha blending to SRC ALPHA * SRC + (1 - SRC ALPHA) * DEST */
    static readonly ALPHA_COMBINE = 2;
    /** Defines that alpha blending to DEST - SRC * DEST */
    static readonly ALPHA_SUBTRACT = 3;
    /** Defines that alpha blending to SRC * DEST */
    static readonly ALPHA_MULTIPLY = 4;
    /** Defines that alpha blending to SRC ALPHA * SRC + (1 - SRC) * DEST */
    static readonly ALPHA_MAXIMIZED = 5;
    /** Defines that alpha blending to SRC + DEST */
    static readonly ALPHA_ONEONE = 6;
    /** Defines that alpha blending to SRC + (1 - SRC ALPHA) * DEST */
    static readonly ALPHA_PREMULTIPLIED = 7;
    /**
     * Defines that alpha blending to SRC + (1 - SRC ALPHA) * DEST
     * Alpha will be set to (1 - SRC ALPHA) * DEST ALPHA
     */
    static readonly ALPHA_PREMULTIPLIED_PORTERDUFF = 8;
    /** Defines that alpha blending to CST * SRC + (1 - CST) * DEST */
    static readonly ALPHA_INTERPOLATE = 9;
    /**
     * Defines that alpha blending to SRC + (1 - SRC) * DEST
     * Alpha will be set to SRC ALPHA + (1 - SRC ALPHA) * DEST ALPHA
     */
    static readonly ALPHA_SCREENMODE = 10;
    /** Defines that the resource is not delayed*/
    static readonly DELAYLOADSTATE_NONE = 0;
    /** Defines that the resource was successfully delay loaded */
    static readonly DELAYLOADSTATE_LOADED = 1;
    /** Defines that the resource is currently delay loading */
    static readonly DELAYLOADSTATE_LOADING = 2;
    /** Defines that the resource is delayed and has not started loading */
    static readonly DELAYLOADSTATE_NOTLOADED = 4;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will never pass. i.e. Nothing will be drawn */
    static readonly NEVER = 512;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will always pass. i.e. Pixels will be drawn in the order they are drawn */
    static readonly ALWAYS = 519;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is less than the stored value */
    static readonly LESS = 513;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is equals to the stored value */
    static readonly EQUAL = 514;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is less than or equal to the stored value */
    static readonly LEQUAL = 515;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is greater than the stored value */
    static readonly GREATER = 516;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is greater than or equal to the stored value */
    static readonly GEQUAL = 518;
    /** Passed to depthFunction or stencilFunction to specify depth or stencil tests will pass if the new depth value is not equal to the stored value */
    static readonly NOTEQUAL = 517;
    /** Passed to stencilOperation to specify that stencil value must be kept */
    static readonly KEEP = 7680;
    /** Passed to stencilOperation to specify that stencil value must be replaced */
    static readonly REPLACE = 7681;
    /** Passed to stencilOperation to specify that stencil value must be incremented */
    static readonly INCR = 7682;
    /** Passed to stencilOperation to specify that stencil value must be decremented */
    static readonly DECR = 7683;
    /** Passed to stencilOperation to specify that stencil value must be inverted */
    static readonly INVERT = 5386;
    /** Passed to stencilOperation to specify that stencil value must be incremented with wrapping */
    static readonly INCR_WRAP = 34055;
    /** Passed to stencilOperation to specify that stencil value must be decremented with wrapping */
    static readonly DECR_WRAP = 34056;
    /** Texture is not repeating outside of 0..1 UVs */
    static readonly TEXTURE_CLAMP_ADDRESSMODE = 0;
    /** Texture is repeating outside of 0..1 UVs */
    static readonly TEXTURE_WRAP_ADDRESSMODE = 1;
    /** Texture is repeating and mirrored */
    static readonly TEXTURE_MIRROR_ADDRESSMODE = 2;
    /** ALPHA */
    static readonly TEXTUREFORMAT_ALPHA = 0;
    /** LUMINANCE */
    static readonly TEXTUREFORMAT_LUMINANCE = 1;
    /** LUMINANCE_ALPHA */
    static readonly TEXTUREFORMAT_LUMINANCE_ALPHA = 2;
    /** RGB */
    static readonly TEXTUREFORMAT_RGB = 4;
    /** RGBA */
    static readonly TEXTUREFORMAT_RGBA = 5;
    /** RED */
    static readonly TEXTUREFORMAT_RED = 6;
    /** RED (2nd reference) */
    static readonly TEXTUREFORMAT_R = 6;
    /** RG */
    static readonly TEXTUREFORMAT_RG = 7;
    /** RED_INTEGER */
    static readonly TEXTUREFORMAT_RED_INTEGER = 8;
    /** RED_INTEGER (2nd reference) */
    static readonly TEXTUREFORMAT_R_INTEGER = 8;
    /** RG_INTEGER */
    static readonly TEXTUREFORMAT_RG_INTEGER = 9;
    /** RGB_INTEGER */
    static readonly TEXTUREFORMAT_RGB_INTEGER = 10;
    /** RGBA_INTEGER */
    static readonly TEXTUREFORMAT_RGBA_INTEGER = 11;
    /** UNSIGNED_BYTE */
    static readonly TEXTURETYPE_UNSIGNED_BYTE = 0;
    /** UNSIGNED_BYTE (2nd reference) */
    static readonly TEXTURETYPE_UNSIGNED_INT = 0;
    /** FLOAT */
    static readonly TEXTURETYPE_FLOAT = 1;
    /** HALF_FLOAT */
    static readonly TEXTURETYPE_HALF_FLOAT = 2;
    /** BYTE */
    static readonly TEXTURETYPE_BYTE = 3;
    /** SHORT */
    static readonly TEXTURETYPE_SHORT = 4;
    /** UNSIGNED_SHORT */
    static readonly TEXTURETYPE_UNSIGNED_SHORT = 5;
    /** INT */
    static readonly TEXTURETYPE_INT = 6;
    /** UNSIGNED_INT */
    static readonly TEXTURETYPE_UNSIGNED_INTEGER = 7;
    /** UNSIGNED_SHORT_4_4_4_4 */
    static readonly TEXTURETYPE_UNSIGNED_SHORT_4_4_4_4 = 8;
    /** UNSIGNED_SHORT_5_5_5_1 */
    static readonly TEXTURETYPE_UNSIGNED_SHORT_5_5_5_1 = 9;
    /** UNSIGNED_SHORT_5_6_5 */
    static readonly TEXTURETYPE_UNSIGNED_SHORT_5_6_5 = 10;
    /** UNSIGNED_INT_2_10_10_10_REV */
    static readonly TEXTURETYPE_UNSIGNED_INT_2_10_10_10_REV = 11;
    /** UNSIGNED_INT_24_8 */
    static readonly TEXTURETYPE_UNSIGNED_INT_24_8 = 12;
    /** UNSIGNED_INT_10F_11F_11F_REV */
    static readonly TEXTURETYPE_UNSIGNED_INT_10F_11F_11F_REV = 13;
    /** UNSIGNED_INT_5_9_9_9_REV */
    static readonly TEXTURETYPE_UNSIGNED_INT_5_9_9_9_REV = 14;
    /** FLOAT_32_UNSIGNED_INT_24_8_REV */
    static readonly TEXTURETYPE_FLOAT_32_UNSIGNED_INT_24_8_REV = 15;
    /** nearest is mag = nearest and min = nearest and mip = none */
    static readonly TEXTURE_NEAREST_SAMPLINGMODE = 1;
    /** Bilinear is mag = linear and min = linear and mip = nearest */
    static readonly TEXTURE_BILINEAR_SAMPLINGMODE = 2;
    /** Trilinear is mag = linear and min = linear and mip = linear */
    static readonly TEXTURE_TRILINEAR_SAMPLINGMODE = 3;
    /** nearest is mag = nearest and min = nearest and mip = linear */
    static readonly TEXTURE_NEAREST_NEAREST_MIPLINEAR = 8;
    /** Bilinear is mag = linear and min = linear and mip = nearest */
    static readonly TEXTURE_LINEAR_LINEAR_MIPNEAREST = 11;
    /** Trilinear is mag = linear and min = linear and mip = linear */
    static readonly TEXTURE_LINEAR_LINEAR_MIPLINEAR = 3;
    /** mag = nearest and min = nearest and mip = nearest */
    static readonly TEXTURE_NEAREST_NEAREST_MIPNEAREST = 4;
    /** mag = nearest and min = linear and mip = nearest */
    static readonly TEXTURE_NEAREST_LINEAR_MIPNEAREST = 5;
    /** mag = nearest and min = linear and mip = linear */
    static readonly TEXTURE_NEAREST_LINEAR_MIPLINEAR = 6;
    /** mag = nearest and min = linear and mip = none */
    static readonly TEXTURE_NEAREST_LINEAR = 7;
    /** mag = nearest and min = nearest and mip = none */
    static readonly TEXTURE_NEAREST_NEAREST = 1;
    /** mag = linear and min = nearest and mip = nearest */
    static readonly TEXTURE_LINEAR_NEAREST_MIPNEAREST = 9;
    /** mag = linear and min = nearest and mip = linear */
    static readonly TEXTURE_LINEAR_NEAREST_MIPLINEAR = 10;
    /** mag = linear and min = linear and mip = none */
    static readonly TEXTURE_LINEAR_LINEAR = 2;
    /** mag = linear and min = nearest and mip = none */
    static readonly TEXTURE_LINEAR_NEAREST = 12;
    /** Explicit coordinates mode */
    static readonly TEXTURE_EXPLICIT_MODE = 0;
    /** Spherical coordinates mode */
    static readonly TEXTURE_SPHERICAL_MODE = 1;
    /** Planar coordinates mode */
    static readonly TEXTURE_PLANAR_MODE = 2;
    /** Cubic coordinates mode */
    static readonly TEXTURE_CUBIC_MODE = 3;
    /** Projection coordinates mode */
    static readonly TEXTURE_PROJECTION_MODE = 4;
    /** Skybox coordinates mode */
    static readonly TEXTURE_SKYBOX_MODE = 5;
    /** Inverse Cubic coordinates mode */
    static readonly TEXTURE_INVCUBIC_MODE = 6;
    /** Equirectangular coordinates mode */
    static readonly TEXTURE_EQUIRECTANGULAR_MODE = 7;
    /** Equirectangular Fixed coordinates mode */
    static readonly TEXTURE_FIXED_EQUIRECTANGULAR_MODE = 8;
    /** Equirectangular Fixed Mirrored coordinates mode */
    static readonly TEXTURE_FIXED_EQUIRECTANGULAR_MIRRORED_MODE = 9;
    /** Defines that texture rescaling will use a floor to find the closer power of 2 size */
    static readonly SCALEMODE_FLOOR = 1;
    /** Defines that texture rescaling will look for the nearest power of 2 size */
    static readonly SCALEMODE_NEAREST = 2;
    /** Defines that texture rescaling will use a ceil to find the closer power of 2 size */
    static readonly SCALEMODE_CEILING = 3;
    /**
     * Returns the current npm package of the sdk
     */
    static get NpmPackage(): string;
    /**
     * Returns the current version of the framework
     */
    static get Version(): string;
    /** Gets the list of created engines */
    static get Instances(): Engine[];
    /**
     * Gets the latest created engine
     */
    static get LastCreatedEngine(): Nullable<Engine>;
    /**
     * Gets the latest created scene
     */
    static get LastCreatedScene(): Nullable<Scene>;
    /** @hidden */
    /**
     * Engine abstraction for loading and creating an image bitmap from a given source string.
     * @param imageSource source to load the image from.
     * @param options An object that sets options for the image's extraction.
     * @returns ImageBitmap.
     */
    _createImageBitmapFromSource(imageSource: string, options?: ImageBitmapOptions): Promise<ImageBitmap>;
    /**
     * Engine abstraction for createImageBitmap
     * @param image source for image
     * @param options An object that sets options for the image's extraction.
     * @returns ImageBitmap
     */
    createImageBitmap(image: ImageBitmapSource, options?: ImageBitmapOptions): Promise<ImageBitmap>;
    /**
     * Resize an image and returns the image data as an uint8array
     * @param image image to resize
     * @param bufferWidth destination buffer width
     * @param bufferHeight destination buffer height
     * @returns an uint8array containing RGBA values of bufferWidth * bufferHeight size
     */
    resizeImageBitmap(image: HTMLImageElement | ImageBitmap, bufferWidth: number, bufferHeight: number): Uint8Array;
    /**
     * Will flag all materials in all scenes in all engines as dirty to trigger new shader compilation
     * @param flag defines which part of the materials must be marked as dirty
     * @param predicate defines a predicate used to filter which materials should be affected
     */
    static MarkAllMaterialsAsDirty(flag: number, predicate?: (mat: Material) => boolean): void;
    /**
     * Method called to create the default loading screen.
     * This can be overridden in your own app.
     * @param canvas The rendering canvas element
     * @returns The loading screen
     */
    static DefaultLoadingScreenFactory(canvas: HTMLCanvasElement): ILoadingScreen;
    /**
     * Method called to create the default rescale post process on each engine.
     */
    static _RescalePostProcessFactory: Nullable<(engine: Engine) => PostProcess>;
    /**
     * Gets or sets a boolean to enable/disable IndexedDB support and avoid XHR on .manifest
     **/
    enableOfflineSupport: boolean;
    /**
     * Gets or sets a boolean to enable/disable checking manifest if IndexedDB support is enabled (js will always consider the database is up to date)
     **/
    disableManifestCheck: boolean;
    /**
     * Gets the list of created scenes
     */
    scenes: Scene[];
    /** @hidden */
    _virtualScenes: Scene[];
    /**
     * Event raised when a new scene is created
     */
    onNewSceneAddedObservable: Observable<Scene>;
    /**
     * Gets the list of created postprocesses
     */
    postProcesses: import("../PostProcesses/postProcess").PostProcess[];
    /**
     * Gets a boolean indicating if the pointer is currently locked
     */
    isPointerLock: boolean;
    /**
     * Observable event triggered each time the rendering canvas is resized
     */
    onResizeObservable: Observable<Engine>;
    /**
     * Observable event triggered each time the canvas loses focus
     */
    onCanvasBlurObservable: Observable<Engine>;
    /**
     * Observable event triggered each time the canvas gains focus
     */
    onCanvasFocusObservable: Observable<Engine>;
    /**
     * Observable event triggered each time the canvas receives pointerout event
     */
    onCanvasPointerOutObservable: Observable<PointerEvent>;
    /**
     * Observable raised when the engine begins a new frame
     */
    onBeginFrameObservable: Observable<Engine>;
    /**
     * If set, will be used to request the next animation frame for the render loop
     */
    customAnimationFrameRequester: Nullable<ICustomAnimationFrameRequester>;
    /**
     * Observable raised when the engine ends the current frame
     */
    onEndFrameObservable: Observable<Engine>;
    /**
     * Observable raised when the engine is about to compile a shader
     */
    onBeforeShaderCompilationObservable: Observable<Engine>;
    /**
     * Observable raised when the engine has just compiled a shader
     */
    onAfterShaderCompilationObservable: Observable<Engine>;
    /**
     * Gets the audio engine
     * @see https://doc.babylonjs.com/how_to/playing_sounds_and_music
     * @ignorenaming
     */
    static audioEngine: Nullable<IAudioEngine>;
    /**
     * Default AudioEngine factory responsible of creating the Audio Engine.
     * By default, this will create a BabylonJS Audio Engine if the workload has been embedded.
     */
    static AudioEngineFactory: (hostElement: Nullable<HTMLElement>, audioContext: Nullable<AudioContext>, audioDestination: Nullable<AudioDestinationNode | MediaStreamAudioDestinationNode>) => IAudioEngine;
    /**
     * Default offline support factory responsible of creating a tool used to store data locally.
     * By default, this will create a Database object if the workload has been embedded.
     */
    static OfflineProviderFactory: (urlToScene: string, callbackManifestChecked: (checked: boolean) => any, disableManifestCheck: boolean) => IOfflineProvider;
    private _loadingScreen;
    private _pointerLockRequested;
    private _rescalePostProcess;
    protected _deterministicLockstep: boolean;
    protected _lockstepMaxSteps: number;
    protected _timeStep: number;
    protected get _supportsHardwareTextureRescaling(): boolean;
    private _fps;
    private _deltaTime;
    /** @hidden */
    _drawCalls: PerfCounter;
    /** Gets or sets the tab index to set to the rendering canvas. 1 is the minimum value to set to be able to capture keyboard events */
    canvasTabIndex: number;
    /**
     * Turn this value on if you want to pause FPS computation when in background
     */
    disablePerformanceMonitorInBackground: boolean;
    private _performanceMonitor;
    /**
     * Gets the performance monitor attached to this engine
     * @see https://doc.babylonjs.com/how_to/optimizing_your_scene#engineinstrumentation
     */
    get performanceMonitor(): PerformanceMonitor;
    private _onFocus;
    private _onBlur;
    private _onCanvasPointerOut;
    private _onCanvasBlur;
    private _onCanvasFocus;
    private _onFullscreenChange;
    private _onPointerLockChange;
    protected _compatibilityMode: boolean;
    /**
     * (WebGPU only) True (default) to be in compatibility mode, meaning rendering all existing scenes without artifacts (same rendering than WebGL).
     * Setting the property to false will improve performances but may not work in some scenes if some precautions are not taken.
     * See https://doc.babylonjs.com/advanced_topics/webGPU/webGPUOptimization/webGPUNonCompatibilityMode for more details
     */
    get compatibilityMode(): boolean;
    set compatibilityMode(mode: boolean);
    /**
     * Gets the HTML element used to attach event listeners
     * @returns a HTML element
     */
    getInputElement(): Nullable<HTMLElement>;
    /**
     * Creates a new engine
     * @param canvasOrContext defines the canvas or WebGL context to use for rendering. If you provide a WebGL context, Babylon.js will not hook events on the canvas (like pointers, keyboards, etc...) so no event observables will be available. This is mostly used when Babylon.js is used as a plugin on a system which already used the WebGL context
     * @param antialias defines enable antialiasing (default: false)
     * @param options defines further options to be sent to the getContext() function
     * @param adaptToDeviceRatio defines whether to adapt to the device's viewport characteristics (default: false)
     */
    constructor(canvasOrContext: Nullable<HTMLCanvasElement | OffscreenCanvas | WebGLRenderingContext | WebGL2RenderingContext>, antialias?: boolean, options?: EngineOptions, adaptToDeviceRatio?: boolean);
    /**
     * Shared initialization across engines types.
     * @param canvas The canvas associated with this instance of the engine.
     * @param doNotHandleTouchAction Defines that engine should ignore modifying touch action attribute and style
     * @param audioEngine Defines if an audio engine should be created by default
     */
    protected _sharedInit(canvas: HTMLCanvasElement, doNotHandleTouchAction: boolean, audioEngine: boolean): void;
    /**
     * Gets current aspect ratio
     * @param viewportOwner defines the camera to use to get the aspect ratio
     * @param useScreen defines if screen size must be used (or the current render target if any)
     * @returns a number defining the aspect ratio
     */
    getAspectRatio(viewportOwner: IViewportOwnerLike, useScreen?: boolean): number;
    /**
     * Gets current screen aspect ratio
     * @returns a number defining the aspect ratio
     */
    getScreenAspectRatio(): number;
    /**
     * Gets the client rect of the HTML canvas attached with the current webGL context
     * @returns a client rectangle
     */
    getRenderingCanvasClientRect(): Nullable<ClientRect>;
    /**
     * Gets the client rect of the HTML element used for events
     * @returns a client rectangle
     */
    getInputElementClientRect(): Nullable<ClientRect>;
    /**
     * Gets a boolean indicating that the engine is running in deterministic lock step mode
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @returns true if engine is in deterministic lock step mode
     */
    isDeterministicLockStep(): boolean;
    /**
     * Gets the max steps when engine is running in deterministic lock step
     * @see https://doc.babylonjs.com/babylon101/animations#deterministic-lockstep
     * @returns the max steps
     */
    getLockstepMaxSteps(): number;
    /**
     * Returns the time in ms between steps when using deterministic lock step.
     * @returns time step in (ms)
     */
    getTimeStep(): number;
    /**
     * Force the mipmap generation for the given render target texture
     * @param texture defines the render target texture to use
     * @param unbind defines whether or not to unbind the texture after generation. Defaults to true.
     */
    generateMipMapsForCubemap(texture: InternalTexture, unbind?: boolean): void;
    /** States */
    /**
     * Gets a boolean indicating if depth testing is enabled
     * @returns the current state
     */
    getDepthBuffer(): boolean;
    /**
     * Enable or disable depth buffering
     * @param enable defines the state to set
     */
    setDepthBuffer(enable: boolean): void;
    /**
     * Gets a boolean indicating if depth writing is enabled
     * @returns the current depth writing state
     */
    getDepthWrite(): boolean;
    /**
     * Enable or disable depth writing
     * @param enable defines the state to set
     */
    setDepthWrite(enable: boolean): void;
    /**
     * Gets a boolean indicating if stencil buffer is enabled
     * @returns the current stencil buffer state
     */
    getStencilBuffer(): boolean;
    /**
     * Enable or disable the stencil buffer
     * @param enable defines if the stencil buffer must be enabled or disabled
     */
    setStencilBuffer(enable: boolean): void;
    /**
     * Gets the current stencil mask
     * @returns a number defining the new stencil mask to use
     */
    getStencilMask(): number;
    /**
     * Sets the current stencil mask
     * @param mask defines the new stencil mask to use
     */
    setStencilMask(mask: number): void;
    /**
     * Gets the current stencil function
     * @returns a number defining the stencil function to use
     */
    getStencilFunction(): number;
    /**
     * Gets the current stencil reference value
     * @returns a number defining the stencil reference value to use
     */
    getStencilFunctionReference(): number;
    /**
     * Gets the current stencil mask
     * @returns a number defining the stencil mask to use
     */
    getStencilFunctionMask(): number;
    /**
     * Sets the current stencil function
     * @param stencilFunc defines the new stencil function to use
     */
    setStencilFunction(stencilFunc: number): void;
    /**
     * Sets the current stencil reference
     * @param reference defines the new stencil reference to use
     */
    setStencilFunctionReference(reference: number): void;
    /**
     * Sets the current stencil mask
     * @param mask defines the new stencil mask to use
     */
    setStencilFunctionMask(mask: number): void;
    /**
     * Gets the current stencil operation when stencil fails
     * @returns a number defining stencil operation to use when stencil fails
     */
    getStencilOperationFail(): number;
    /**
     * Gets the current stencil operation when depth fails
     * @returns a number defining stencil operation to use when depth fails
     */
    getStencilOperationDepthFail(): number;
    /**
     * Gets the current stencil operation when stencil passes
     * @returns a number defining stencil operation to use when stencil passes
     */
    getStencilOperationPass(): number;
    /**
     * Sets the stencil operation to use when stencil fails
     * @param operation defines the stencil operation to use when stencil fails
     */
    setStencilOperationFail(operation: number): void;
    /**
     * Sets the stencil operation to use when depth fails
     * @param operation defines the stencil operation to use when depth fails
     */
    setStencilOperationDepthFail(operation: number): void;
    /**
     * Sets the stencil operation to use when stencil passes
     * @param operation defines the stencil operation to use when stencil passes
     */
    setStencilOperationPass(operation: number): void;
    /**
     * Sets a boolean indicating if the dithering state is enabled or disabled
     * @param value defines the dithering state
     */
    setDitheringState(value: boolean): void;
    /**
     * Sets a boolean indicating if the rasterizer state is enabled or disabled
     * @param value defines the rasterizer state
     */
    setRasterizerState(value: boolean): void;
    /**
     * Gets the current depth function
     * @returns a number defining the depth function
     */
    getDepthFunction(): Nullable<number>;
    /**
     * Sets the current depth function
     * @param depthFunc defines the function to use
     */
    setDepthFunction(depthFunc: number): void;
    /**
     * Sets the current depth function to GREATER
     */
    setDepthFunctionToGreater(): void;
    /**
     * Sets the current depth function to GEQUAL
     */
    setDepthFunctionToGreaterOrEqual(): void;
    /**
     * Sets the current depth function to LESS
     */
    setDepthFunctionToLess(): void;
    /**
     * Sets the current depth function to LEQUAL
     */
    setDepthFunctionToLessOrEqual(): void;
    private _cachedStencilBuffer;
    private _cachedStencilFunction;
    private _cachedStencilMask;
    private _cachedStencilOperationPass;
    private _cachedStencilOperationFail;
    private _cachedStencilOperationDepthFail;
    private _cachedStencilReference;
    /**
     * Caches the the state of the stencil buffer
     */
    cacheStencilState(): void;
    /**
     * Restores the state of the stencil buffer
     */
    restoreStencilState(): void;
    /**
     * Directly set the WebGL Viewport
     * @param x defines the x coordinate of the viewport (in screen space)
     * @param y defines the y coordinate of the viewport (in screen space)
     * @param width defines the width of the viewport (in screen space)
     * @param height defines the height of the viewport (in screen space)
     * @return the current viewport Object (if any) that is being replaced by this call. You can restore this viewport later on to go back to the original state
     */
    setDirectViewport(x: number, y: number, width: number, height: number): Nullable<IViewportLike>;
    /**
     * Executes a scissor clear (ie. a clear on a specific portion of the screen)
     * @param x defines the x-coordinate of the top left corner of the clear rectangle
     * @param y defines the y-coordinate of the corner of the clear rectangle
     * @param width defines the width of the clear rectangle
     * @param height defines the height of the clear rectangle
     * @param clearColor defines the clear color
     */
    scissorClear(x: number, y: number, width: number, height: number, clearColor: IColor4Like): void;
    /**
     * Enable scissor test on a specific rectangle (ie. render will only be executed on a specific portion of the screen)
     * @param x defines the x-coordinate of the top left corner of the clear rectangle
     * @param y defines the y-coordinate of the corner of the clear rectangle
     * @param width defines the width of the clear rectangle
     * @param height defines the height of the clear rectangle
     */
    enableScissor(x: number, y: number, width: number, height: number): void;
    /**
     * Disable previously set scissor test rectangle
     */
    disableScissor(): void;
    /**
     * @param numDrawCalls
     * @hidden
     */
    _reportDrawCall(numDrawCalls?: number): void;
    /**
     * Initializes a webVR display and starts listening to display change events
     * The onVRDisplayChangedObservable will be notified upon these changes
     * @returns The onVRDisplayChangedObservable
     */
    initWebVR(): Observable<IDisplayChangedEventArgs>;
    /** @hidden */
    _prepareVRComponent(): void;
    /**
     * @param canvas
     * @param document
     * @hidden
     */
    _connectVREvents(canvas?: HTMLCanvasElement, document?: any): void;
    /** @hidden */
    _submitVRFrame(): void;
    /**
     * Call this function to leave webVR mode
     * Will do nothing if webVR is not supported or if there is no webVR device
     * @see https://doc.babylonjs.com/how_to/webvr_camera
     */
    disableVR(): void;
    /**
     * Gets a boolean indicating that the system is in VR mode and is presenting
     * @returns true if VR mode is engaged
     */
    isVRPresenting(): boolean;
    /** @hidden */
    _requestVRFrame(): void;
    /**
     * @param url
     * @param offlineProvider
     * @param useArrayBuffer
     * @hidden
     */
    _loadFileAsync(url: string, offlineProvider?: IOfflineProvider, useArrayBuffer?: boolean): Promise<string | ArrayBuffer>;
    /**
     * Gets the source code of the vertex shader associated with a specific webGL program
     * @param program defines the program to use
     * @returns a string containing the source code of the vertex shader associated with the program
     */
    getVertexShaderSource(program: WebGLProgram): Nullable<string>;
    /**
     * Gets the source code of the fragment shader associated with a specific webGL program
     * @param program defines the program to use
     * @returns a string containing the source code of the fragment shader associated with the program
     */
    getFragmentShaderSource(program: WebGLProgram): Nullable<string>;
    /**
     * Sets a depth stencil texture from a render target to the according uniform.
     * @param channel The texture channel
     * @param uniform The uniform to set
     * @param texture The render target texture containing the depth stencil texture to apply
     * @param name The texture name
     */
    setDepthStencilTexture(channel: number, uniform: Nullable<WebGLUniformLocation>, texture: Nullable<RenderTargetTexture>, name?: string): void;
    /**
     * Sets a texture to the webGL context from a postprocess
     * @param channel defines the channel to use
     * @param postProcess defines the source postprocess
     * @param name name of the channel
     */
    setTextureFromPostProcess(channel: number, postProcess: Nullable<PostProcess>, name: string): void;
    /**
     * Binds the output of the passed in post process to the texture channel specified
     * @param channel The channel the texture should be bound to
     * @param postProcess The post process which's output should be bound
     * @param name name of the channel
     */
    setTextureFromPostProcessOutput(channel: number, postProcess: Nullable<PostProcess>, name: string): void;
    protected _rebuildBuffers(): void;
    /** @hidden */
    _renderFrame(): void;
    _renderLoop(): void;
    /** @hidden */
    _renderViews(): boolean;
    /**
     * Toggle full screen mode
     * @param requestPointerLock defines if a pointer lock should be requested from the user
     */
    switchFullscreen(requestPointerLock: boolean): void;
    /**
     * Enters full screen mode
     * @param requestPointerLock defines if a pointer lock should be requested from the user
     */
    enterFullscreen(requestPointerLock: boolean): void;
    /**
     * Exits full screen mode
     */
    exitFullscreen(): void;
    /**
     * Enters Pointerlock mode
     */
    enterPointerlock(): void;
    /**
     * Exits Pointerlock mode
     */
    exitPointerlock(): void;
    /**
     * Begin a new frame
     */
    beginFrame(): void;
    /**
     * End the current frame
     */
    endFrame(): void;
    /**
     * Resize the view according to the canvas' size
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     */
    resize(forceSetSize?: boolean): void;
    /**
     * Force a specific size of the canvas
     * @param width defines the new canvas' width
     * @param height defines the new canvas' height
     * @param forceSetSize true to force setting the sizes of the underlying canvas
     * @returns true if the size was changed
     */
    setSize(width: number, height: number, forceSetSize?: boolean): boolean;
    _deletePipelineContext(pipelineContext: IPipelineContext): void;
    createShaderProgram(pipelineContext: IPipelineContext, vertexCode: string, fragmentCode: string, defines: Nullable<string>, context?: WebGLRenderingContext, transformFeedbackVaryings?: Nullable<string[]>): WebGLProgram;
    protected _createShaderProgram(pipelineContext: WebGLPipelineContext, vertexShader: WebGLShader, fragmentShader: WebGLShader, context: WebGLRenderingContext, transformFeedbackVaryings?: Nullable<string[]>): WebGLProgram;
    /**
     * @param texture
     * @hidden
     */
    _releaseTexture(texture: InternalTexture): void;
    /**
     * @param rtWrapper
     * @hidden
     */
    _releaseRenderTargetWrapper(rtWrapper: RenderTargetWrapper): void;
    protected static _RenderPassIdCounter: number;
    /**
     * Gets or sets the current render pass id
     */
    currentRenderPassId: number;
    private _renderPassNames;
    /**
     * Gets the names of the render passes that are currently created
     * @returns list of the render pass names
     */
    getRenderPassNames(): string[];
    /**
     * Gets the name of the current render pass
     * @returns name of the current render pass
     */
    getCurrentRenderPassName(): string;
    /**
     * Creates a render pass id
     * @param name Name of the render pass (for debug purpose only)
     * @returns the id of the new render pass
     */
    createRenderPassId(name?: string): number;
    /**
     * Releases a render pass id
     * @param id id of the render pass to release
     */
    releaseRenderPassId(id: number): void;
    /**
     * @hidden
     * Rescales a texture
     * @param source input texture
     * @param destination destination texture
     * @param scene scene to use to render the resize
     * @param internalFormat format to use when resizing
     * @param onComplete callback to be called when resize has completed
     */
    _rescaleTexture(source: InternalTexture, destination: InternalTexture, scene: Nullable<any>, internalFormat: number, onComplete: () => void): void;
    /**
     * Gets the current framerate
     * @returns a number representing the framerate
     */
    getFps(): number;
    /**
     * Gets the time spent between current and previous frame
     * @returns a number representing the delta time in ms
     */
    getDeltaTime(): number;
    private _measureFps;
    /**
     * Wraps an external web gl texture in a Babylon texture.
     * @param texture defines the external texture
     * @returns the babylon internal texture
     */
    wrapWebGLTexture(texture: WebGLTexture): InternalTexture;
    /**
     * @param texture
     * @param image
     * @param faceIndex
     * @param lod
     * @hidden
     */
    _uploadImageToTexture(texture: InternalTexture, image: HTMLImageElement | ImageBitmap, faceIndex?: number, lod?: number): void;
    /**
     * Updates a depth texture Comparison Mode and Function.
     * If the comparison Function is equal to 0, the mode will be set to none.
     * Otherwise, this only works in webgl 2 and requires a shadow sampler in the shader.
     * @param texture The texture to set the comparison function for
     * @param comparisonFunction The comparison function to set, 0 if no comparison required
     */
    updateTextureComparisonFunction(texture: InternalTexture, comparisonFunction: number): void;
    /**
     * Creates a webGL buffer to use with instantiation
     * @param capacity defines the size of the buffer
     * @returns the webGL buffer
     */
    createInstancesBuffer(capacity: number): DataBuffer;
    /**
     * Delete a webGL buffer used with instantiation
     * @param buffer defines the webGL buffer to delete
     */
    deleteInstancesBuffer(buffer: WebGLBuffer): void;
    private _clientWaitAsync;
    /**
     * @param x
     * @param y
     * @param w
     * @param h
     * @param format
     * @param type
     * @param outputBuffer
     * @hidden
     */
    _readPixelsAsync(x: number, y: number, w: number, h: number, format: number, type: number, outputBuffer: ArrayBufferView): Promise<ArrayBufferView> | null;
    dispose(): void;
    private _disableTouchAction;
    /**
     * Display the loading screen
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    displayLoadingUI(): void;
    /**
     * Hide the loading screen
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    hideLoadingUI(): void;
    /**
     * Gets the current loading screen object
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    get loadingScreen(): ILoadingScreen;
    /**
     * Sets the current loading screen object
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    set loadingScreen(loadingScreen: ILoadingScreen);
    /**
     * Sets the current loading screen text
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    set loadingUIText(text: string);
    /**
     * Sets the current loading screen background color
     * @see https://doc.babylonjs.com/how_to/creating_a_custom_loading_screen
     */
    set loadingUIBackgroundColor(color: string);
    /**
     * creates and returns a new video element
     * @param constraints video constraints
     * @returns video element
     */
    createVideoElement(constraints: MediaTrackConstraints): any;
    /** Pointerlock and fullscreen */
    /**
     * Ask the browser to promote the current element to pointerlock mode
     * @param element defines the DOM element to promote
     */
    static _RequestPointerlock(element: HTMLElement): void;
    /**
     * Asks the browser to exit pointerlock mode
     */
    static _ExitPointerlock(): void;
    /**
     * Ask the browser to promote the current element to fullscreen rendering mode
     * @param element defines the DOM element to promote
     */
    static _RequestFullscreen(element: HTMLElement): void;
    /**
     * Asks the browser to exit fullscreen mode
     */
    static _ExitFullscreen(): void;
    /**
     * Get Font size information
     * @param font font name
     * @return an object containing ascent, height and descent
     */
    getFontOffset(font: string): {
        ascent: number;
        height: number;
        descent: number;
    };
}
export {};
