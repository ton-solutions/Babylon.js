import { Observable } from "../../Misc/observable";
import { Tools } from "../../Misc/tools";
import { Logger } from "../../Misc/logger";
import { Texture } from "../../Materials/Textures/texture";
import "../../Engines/Extensions/engine.videoTexture";
import "../../Engines/Extensions/engine.dynamicTexture";
function removeSource(video) {
    // Remove any <source> elements, etc.
    while (video.firstChild) {
        video.removeChild(video.firstChild);
    }
    // detach srcObject
    video.srcObject = null;
    // Set a blank src (https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements)
    video.src = "";
    // Prevent non-important errors maybe (https://twitter.com/beraliv/status/1205214277956775936)
    video.removeAttribute("src");
}
/**
 * If you want to display a video in your scene, this is the special texture for that.
 * This special texture works similar to other textures, with the exception of a few parameters.
 * @see https://doc.babylonjs.com/divingDeeper/materials/using/videoTexture
 */
export class VideoTexture extends Texture {
    /**
     * Creates a video texture.
     * If you want to display a video in your scene, this is the special texture for that.
     * This special texture works similar to other textures, with the exception of a few parameters.
     * @see https://doc.babylonjs.com/how_to/video_texture
     * @param name optional name, will detect from video source, if not defined
     * @param src can be used to provide an url, array of urls or an already setup HTML video element.
     * @param scene is obviously the current scene.
     * @param generateMipMaps can be used to turn on mipmaps (Can be expensive for videoTextures because they are often updated).
     * @param invertY is false by default but can be used to invert video on Y axis
     * @param samplingMode controls the sampling method and is set to TRILINEAR_SAMPLINGMODE by default
     * @param settings allows finer control over video usage
     * @param onError defines a callback triggered when an error occurred during the loading session
     */
    constructor(name, src, scene, generateMipMaps = false, invertY = false, samplingMode = Texture.TRILINEAR_SAMPLINGMODE, settings = {}, onError) {
        super(null, scene, !generateMipMaps, invertY);
        this._onUserActionRequestedObservable = null;
        this._stillImageCaptured = false;
        this._displayingPosterTexture = false;
        this._frameId = -1;
        this._currentSrc = null;
        this._errorFound = false;
        this._createInternalTexture = () => {
            if (this._texture != null) {
                if (this._displayingPosterTexture) {
                    this._texture.dispose();
                    this._displayingPosterTexture = false;
                }
                else {
                    return;
                }
            }
            if (!this._getEngine().needPOTTextures || (Tools.IsExponentOfTwo(this.video.videoWidth) && Tools.IsExponentOfTwo(this.video.videoHeight))) {
                this.wrapU = Texture.WRAP_ADDRESSMODE;
                this.wrapV = Texture.WRAP_ADDRESSMODE;
            }
            else {
                this.wrapU = Texture.CLAMP_ADDRESSMODE;
                this.wrapV = Texture.CLAMP_ADDRESSMODE;
                this._generateMipMaps = false;
            }
            this._texture = this._getEngine().createDynamicTexture(this.video.videoWidth, this.video.videoHeight, this._generateMipMaps, this.samplingMode);
            if (!this.video.autoplay && !this._settings.poster) {
                const oldHandler = this.video.onplaying;
                const oldMuted = this.video.muted;
                this.video.muted = true;
                this.video.onplaying = () => {
                    this.video.muted = oldMuted;
                    this.video.onplaying = oldHandler;
                    this._updateInternalTexture();
                    if (!this._errorFound) {
                        this.video.pause();
                    }
                    if (this.onLoadObservable.hasObservers()) {
                        this.onLoadObservable.notifyObservers(this);
                    }
                };
                this._handlePlay();
            }
            else {
                this._updateInternalTexture();
                if (this.onLoadObservable.hasObservers()) {
                    this.onLoadObservable.notifyObservers(this);
                }
            }
        };
        this._reset = () => {
            if (this._texture == null) {
                return;
            }
            if (!this._displayingPosterTexture) {
                this._texture.dispose();
                this._texture = null;
            }
        };
        this._updateInternalTexture = () => {
            if (this._texture == null) {
                return;
            }
            if (this.video.readyState < this.video.HAVE_CURRENT_DATA) {
                return;
            }
            if (this._displayingPosterTexture) {
                return;
            }
            const frameId = this.getScene().getFrameId();
            if (this._frameId === frameId) {
                return;
            }
            this._frameId = frameId;
            this._getEngine().updateVideoTexture(this._texture, this.video, this._invertY);
        };
        this._settings = Object.assign({ autoPlay: true, loop: true, autoUpdateTexture: true }, settings);
        this._onError = onError;
        this._generateMipMaps = generateMipMaps;
        this._initialSamplingMode = samplingMode;
        this.autoUpdateTexture = this._settings.autoUpdateTexture;
        this._currentSrc = src;
        this.name = name || this._getName(src);
        this.video = this._getVideo(src);
        if (this._settings.poster) {
            this.video.poster = this._settings.poster;
        }
        if (this._settings.autoPlay !== undefined) {
            this.video.autoplay = this._settings.autoPlay;
        }
        if (this._settings.loop !== undefined) {
            this.video.loop = this._settings.loop;
        }
        if (this._settings.muted !== undefined) {
            this.video.muted = this._settings.muted;
        }
        this.video.setAttribute("playsinline", "");
        this.video.addEventListener("paused", this._updateInternalTexture);
        this.video.addEventListener("seeked", this._updateInternalTexture);
        this.video.addEventListener("emptied", this._reset);
        this._createInternalTextureOnEvent = this._settings.poster && !this._settings.autoPlay ? "play" : "canplay";
        this.video.addEventListener(this._createInternalTextureOnEvent, this._createInternalTexture);
        if (this._settings.autoPlay) {
            this._handlePlay();
        }
        const videoHasEnoughData = this.video.readyState >= this.video.HAVE_CURRENT_DATA;
        if (this._settings.poster && (!this._settings.autoPlay || !videoHasEnoughData)) {
            this._texture = this._getEngine().createTexture(this._settings.poster, false, !this.invertY, scene);
            this._displayingPosterTexture = true;
        }
        else if (videoHasEnoughData) {
            this._createInternalTexture();
        }
    }
    /**
     * Event triggered when a dom action is required by the user to play the video.
     * This happens due to recent changes in browser policies preventing video to auto start.
     */
    get onUserActionRequestedObservable() {
        if (!this._onUserActionRequestedObservable) {
            this._onUserActionRequestedObservable = new Observable();
        }
        return this._onUserActionRequestedObservable;
    }
    _processError(reason) {
        this._errorFound = true;
        if (this._onError) {
            this._onError(reason === null || reason === void 0 ? void 0 : reason.message);
        }
        else {
            Logger.Error(reason === null || reason === void 0 ? void 0 : reason.message);
        }
    }
    _handlePlay() {
        this._errorFound = false;
        this.video.play().catch((reason) => {
            if ((reason === null || reason === void 0 ? void 0 : reason.name) === "NotAllowedError") {
                if (this._onUserActionRequestedObservable && this._onUserActionRequestedObservable.hasObservers()) {
                    this._onUserActionRequestedObservable.notifyObservers(this);
                    return;
                }
                else if (!this.video.muted) {
                    Logger.Warn("Unable to autoplay a video with sound. Trying again with muted turned true");
                    this.video.muted = true;
                    this._errorFound = false;
                    this.video.play().catch((otherReason) => {
                        this._processError(otherReason);
                    });
                    return;
                }
            }
            this._processError(reason);
        });
    }
    /**
     * Get the current class name of the video texture useful for serialization or dynamic coding.
     * @returns "VideoTexture"
     */
    getClassName() {
        return "VideoTexture";
    }
    _getName(src) {
        if (src instanceof HTMLVideoElement) {
            return src.currentSrc;
        }
        if (typeof src === "object") {
            return src.toString();
        }
        return src;
    }
    _getVideo(src) {
        if (src.isNative) {
            return src;
        }
        if (src instanceof HTMLVideoElement) {
            Tools.SetCorsBehavior(src.currentSrc, src);
            return src;
        }
        const video = document.createElement("video");
        if (typeof src === "string") {
            Tools.SetCorsBehavior(src, video);
            video.src = src;
        }
        else {
            Tools.SetCorsBehavior(src[0], video);
            src.forEach((url) => {
                const source = document.createElement("source");
                source.src = url;
                video.appendChild(source);
            });
        }
        this.onDisposeObservable.addOnce(() => {
            removeSource(video);
        });
        return video;
    }
    /**
     * @hidden Internal method to initiate `update`.
     */
    _rebuild() {
        this.update();
    }
    /**
     * Update Texture in the `auto` mode. Does not do anything if `settings.autoUpdateTexture` is false.
     */
    update() {
        if (!this.autoUpdateTexture) {
            // Expecting user to call `updateTexture` manually
            return;
        }
        this.updateTexture(true);
    }
    /**
     * Update Texture in `manual` mode. Does not do anything if not visible or paused.
     * @param isVisible Visibility state, detected by user using `scene.getActiveMeshes()` or otherwise.
     */
    updateTexture(isVisible) {
        if (!isVisible) {
            return;
        }
        if (this.video.paused && this._stillImageCaptured) {
            return;
        }
        this._stillImageCaptured = true;
        this._updateInternalTexture();
    }
    /**
     * Change video content. Changing video instance or setting multiple urls (as in constructor) is not supported.
     * @param url New url.
     */
    updateURL(url) {
        this.video.src = url;
        this._currentSrc = url;
    }
    /**
     * Clones the texture.
     * @returns the cloned texture
     */
    clone() {
        return new VideoTexture(this.name, this._currentSrc, this.getScene(), this._generateMipMaps, this.invertY, this.samplingMode, this._settings);
    }
    /**
     * Dispose the texture and release its associated resources.
     */
    dispose() {
        super.dispose();
        this._currentSrc = null;
        if (this._onUserActionRequestedObservable) {
            this._onUserActionRequestedObservable.clear();
            this._onUserActionRequestedObservable = null;
        }
        this.video.removeEventListener(this._createInternalTextureOnEvent, this._createInternalTexture);
        this.video.removeEventListener("paused", this._updateInternalTexture);
        this.video.removeEventListener("seeked", this._updateInternalTexture);
        this.video.removeEventListener("emptied", this._reset);
        this.video.pause();
    }
    /**
     * Creates a video texture straight from a stream.
     * @param scene Define the scene the texture should be created in
     * @param stream Define the stream the texture should be created from
     * @param constraints video constraints
     * @param invertY Defines if the video should be stored with invert Y set to true (true by default)
     * @returns The created video texture as a promise
     */
    static CreateFromStreamAsync(scene, stream, constraints, invertY = true) {
        const video = scene.getEngine().createVideoElement(constraints);
        if (scene.getEngine()._badOS) {
            // Yes... I know and I hope to remove it soon...
            document.body.appendChild(video);
            video.style.transform = "scale(0.0001, 0.0001)";
            video.style.opacity = "0";
            video.style.position = "fixed";
            video.style.bottom = "0px";
            video.style.right = "0px";
        }
        video.setAttribute("autoplay", "");
        video.setAttribute("muted", "true");
        video.setAttribute("playsinline", "");
        video.muted = true;
        if (video.mozSrcObject !== undefined) {
            // hack for Firefox < 19
            video.mozSrcObject = stream;
        }
        else {
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            }
            else {
                window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                // older API. See https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL#using_object_urls_for_media_streams
                video.src = window.URL && window.URL.createObjectURL(stream);
            }
        }
        return new Promise((resolve) => {
            const onPlaying = () => {
                const videoTexture = new VideoTexture("video", video, scene, true, invertY);
                if (scene.getEngine()._badOS) {
                    videoTexture.onDisposeObservable.addOnce(() => {
                        video.remove();
                    });
                }
                videoTexture.onDisposeObservable.addOnce(() => {
                    removeSource(video);
                });
                resolve(videoTexture);
                video.removeEventListener("playing", onPlaying);
            };
            video.addEventListener("playing", onPlaying);
            video.play();
        });
    }
    /**
     * Creates a video texture straight from your WebCam video feed.
     * @param scene Define the scene the texture should be created in
     * @param constraints Define the constraints to use to create the web cam feed from WebRTC
     * @param audioConstaints Define the audio constraints to use to create the web cam feed from WebRTC
     * @param invertY Defines if the video should be stored with invert Y set to true (true by default)
     * @returns The created video texture as a promise
     */
    static CreateFromWebCamAsync(scene, constraints, audioConstaints = false, invertY = true) {
        let constraintsDeviceId;
        if (constraints && constraints.deviceId) {
            constraintsDeviceId = {
                exact: constraints.deviceId,
            };
        }
        if (navigator.mediaDevices) {
            return navigator.mediaDevices
                .getUserMedia({
                video: constraints,
                audio: audioConstaints,
            })
                .then((stream) => {
                return this.CreateFromStreamAsync(scene, stream, constraints, invertY);
            });
        }
        else {
            const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (getUserMedia) {
                getUserMedia({
                    video: {
                        deviceId: constraintsDeviceId,
                        width: {
                            min: (constraints && constraints.minWidth) || 256,
                            max: (constraints && constraints.maxWidth) || 640,
                        },
                        height: {
                            min: (constraints && constraints.minHeight) || 256,
                            max: (constraints && constraints.maxHeight) || 480,
                        },
                    },
                    audio: audioConstaints,
                }, (stream) => {
                    return this.CreateFromStreamAsync(scene, stream, constraints, invertY);
                }, function (e) {
                    Logger.Error(e.name);
                });
            }
        }
        return Promise.reject("No support for userMedia on this device");
    }
    /**
     * Creates a video texture straight from your WebCam video feed.
     * @param scene Defines the scene the texture should be created in
     * @param onReady Defines a callback to triggered once the texture will be ready
     * @param constraints Defines the constraints to use to create the web cam feed from WebRTC
     * @param audioConstaints Defines the audio constraints to use to create the web cam feed from WebRTC
     * @param invertY Defines if the video should be stored with invert Y set to true (true by default)
     */
    static CreateFromWebCam(scene, onReady, constraints, audioConstaints = false, invertY = true) {
        this.CreateFromWebCamAsync(scene, constraints, audioConstaints, invertY)
            .then(function (videoTexture) {
            if (onReady) {
                onReady(videoTexture);
            }
        })
            .catch(function (err) {
            Logger.Error(err.name);
        });
    }
}
//# sourceMappingURL=videoTexture.js.map