import { Texture } from "./texture";
import { Constants } from "../../Engines/constants";
import "../../Engines/Extensions/engine.rawTexture";
/**
 * Raw texture can help creating a texture directly from an array of data.
 * This can be super useful if you either get the data from an uncompressed source or
 * if you wish to create your texture pixel by pixel.
 */
export class RawTexture extends Texture {
    /**
     * Instantiates a new RawTexture.
     * Raw texture can help creating a texture directly from an array of data.
     * This can be super useful if you either get the data from an uncompressed source or
     * if you wish to create your texture pixel by pixel.
     * @param data define the array of data to use to create the texture (null to create an empty texture)
     * @param width define the width of the texture
     * @param height define the height of the texture
     * @param format define the format of the data (RGB, RGBA... Engine.TEXTUREFORMAT_xxx)
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps define whether mip maps should be generated or not
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @param creationFlags specific flags to use when creating the texture (Constants.TEXTURE_CREATIONFLAG_STORAGE for storage textures, for eg)
     */
    constructor(data, width, height, 
    /**
     * Define the format of the data (RGB, RGBA... Engine.TEXTUREFORMAT_xxx)
     */
    format, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, type = Constants.TEXTURETYPE_UNSIGNED_INT, creationFlags) {
        super(null, sceneOrEngine, !generateMipMaps, invertY, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, creationFlags);
        this.format = format;
        if (!this._engine) {
            return;
        }
        if (!this._engine._caps.textureFloatLinearFiltering && type === Constants.TEXTURETYPE_FLOAT) {
            samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE;
        }
        if (!this._engine._caps.textureHalfFloatLinearFiltering && type === Constants.TEXTURETYPE_HALF_FLOAT) {
            samplingMode = Constants.TEXTURE_NEAREST_SAMPLINGMODE;
        }
        this._texture = this._engine.createRawTexture(data, width, height, format, generateMipMaps, invertY, samplingMode, null, type, creationFlags !== null && creationFlags !== void 0 ? creationFlags : 0);
        this.wrapU = Texture.CLAMP_ADDRESSMODE;
        this.wrapV = Texture.CLAMP_ADDRESSMODE;
    }
    /**
     * Updates the texture underlying data.
     * @param data Define the new data of the texture
     */
    update(data) {
        this._getEngine().updateRawTexture(this._texture, data, this._texture.format, this._texture.invertY, null, this._texture.type);
    }
    /**
     * Creates a luminance texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the luminance texture
     */
    static CreateLuminanceTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_LUMINANCE, sceneOrEngine, generateMipMaps, invertY, samplingMode);
    }
    /**
     * Creates a luminance alpha texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the luminance alpha texture
     */
    static CreateLuminanceAlphaTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_LUMINANCE_ALPHA, sceneOrEngine, generateMipMaps, invertY, samplingMode);
    }
    /**
     * Creates an alpha texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @returns the alpha texture
     */
    static CreateAlphaTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_ALPHA, sceneOrEngine, generateMipMaps, invertY, samplingMode);
    }
    /**
     * Creates a RGB texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGB alpha texture
     */
    static CreateRGBTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, type = Constants.TEXTURETYPE_UNSIGNED_INT) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_RGB, sceneOrEngine, generateMipMaps, invertY, samplingMode, type);
    }
    /**
     * Creates a RGBA texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGBA texture
     */
    static CreateRGBATexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, type = Constants.TEXTURETYPE_UNSIGNED_INT) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_RGBA, sceneOrEngine, generateMipMaps, invertY, samplingMode, type);
    }
    /**
     * Creates a RGBA storage texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the RGBA texture
     */
    static CreateRGBAStorageTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Constants.TEXTURE_TRILINEAR_SAMPLINGMODE, type = Constants.TEXTURETYPE_UNSIGNED_INT) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_RGBA, sceneOrEngine, generateMipMaps, invertY, samplingMode, type, Constants.TEXTURE_CREATIONFLAG_STORAGE);
    }
    /**
     * Creates a R texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the R texture
     */
    static CreateRTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Texture.TRILINEAR_SAMPLINGMODE, type = Constants.TEXTURETYPE_FLOAT) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_R, sceneOrEngine, generateMipMaps, invertY, samplingMode, type);
    }
    /**
     * Creates a R storage texture from some data.
     * @param data Define the texture data
     * @param width Define the width of the texture
     * @param height Define the height of the texture
     * @param sceneOrEngine defines the scene or engine the texture will belong to
     * @param generateMipMaps Define whether or not to create mip maps for the texture
     * @param invertY define if the data should be flipped on Y when uploaded to the GPU
     * @param samplingMode define the texture sampling mode (Texture.xxx_SAMPLINGMODE)
     * @param type define the format of the data (int, float... Engine.TEXTURETYPE_xxx)
     * @returns the R texture
     */
    static CreateRStorageTexture(data, width, height, sceneOrEngine, generateMipMaps = true, invertY = false, samplingMode = Texture.TRILINEAR_SAMPLINGMODE, type = Constants.TEXTURETYPE_FLOAT) {
        return new RawTexture(data, width, height, Constants.TEXTUREFORMAT_R, sceneOrEngine, generateMipMaps, invertY, samplingMode, type, Constants.TEXTURE_CREATIONFLAG_STORAGE);
    }
}
//# sourceMappingURL=rawTexture.js.map