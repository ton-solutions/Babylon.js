import { __decorate } from "tslib";
import { NodeMaterialBlock } from "../../nodeMaterialBlock";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets";
import { RegisterClass } from "../../../../Misc/typeStore";
import { editableInPropertyPage, PropertyTypeForEdition } from "../../nodeMaterialDecorator";
import "../../../../Shaders/ShadersInclude/helperFunctions";
import "../../../../Shaders/ShadersInclude/imageProcessingDeclaration";
import "../../../../Shaders/ShadersInclude/imageProcessingFunctions";
/**
 * Block used to add image processing support to fragment shader
 */
export class ImageProcessingBlock extends NodeMaterialBlock {
    /**
     * Create a new ImageProcessingBlock
     * @param name defines the block name
     */
    constructor(name) {
        super(name, NodeMaterialBlockTargets.Fragment);
        /**
         * Defines if the input should be converted to linear space (default: true)
         */
        this.convertInputToLinearSpace = true;
        this.registerInput("color", NodeMaterialBlockConnectionPointTypes.Color4);
        this.registerOutput("output", NodeMaterialBlockConnectionPointTypes.Color4);
        this._inputs[0].acceptedConnectionPointTypes.push(NodeMaterialBlockConnectionPointTypes.Color3);
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    getClassName() {
        return "ImageProcessingBlock";
    }
    /**
     * Gets the color input component
     */
    get color() {
        return this._inputs[0];
    }
    /**
     * Gets the output component
     */
    get output() {
        return this._outputs[0];
    }
    /**
     * Initialize the block and prepare the context for build
     * @param state defines the state that will be used for the build
     */
    initialize(state) {
        state._excludeVariableName("exposureLinear");
        state._excludeVariableName("contrast");
        state._excludeVariableName("vInverseScreenSize");
        state._excludeVariableName("vignetteSettings1");
        state._excludeVariableName("vignetteSettings2");
        state._excludeVariableName("vCameraColorCurveNegative");
        state._excludeVariableName("vCameraColorCurveNeutral");
        state._excludeVariableName("vCameraColorCurvePositive");
        state._excludeVariableName("txColorTransform");
        state._excludeVariableName("colorTransformSettings");
    }
    isReady(mesh, nodeMaterial, defines) {
        if (defines._areImageProcessingDirty && nodeMaterial.imageProcessingConfiguration) {
            if (!nodeMaterial.imageProcessingConfiguration.isReady()) {
                return false;
            }
        }
        return true;
    }
    prepareDefines(mesh, nodeMaterial, defines) {
        if (defines._areImageProcessingDirty && nodeMaterial.imageProcessingConfiguration) {
            nodeMaterial.imageProcessingConfiguration.prepareDefines(defines);
        }
    }
    bind(effect, nodeMaterial, mesh) {
        if (!mesh) {
            return;
        }
        if (!nodeMaterial.imageProcessingConfiguration) {
            return;
        }
        nodeMaterial.imageProcessingConfiguration.bind(effect);
    }
    _buildBlock(state) {
        super._buildBlock(state);
        // Register for defines
        state.sharedData.blocksWithDefines.push(this);
        // Register for blocking
        state.sharedData.blockingBlocks.push(this);
        // Register for binding
        state.sharedData.bindableBlocks.push(this);
        // Uniforms
        state.uniforms.push("exposureLinear");
        state.uniforms.push("contrast");
        state.uniforms.push("vInverseScreenSize");
        state.uniforms.push("vignetteSettings1");
        state.uniforms.push("vignetteSettings2");
        state.uniforms.push("vCameraColorCurveNegative");
        state.uniforms.push("vCameraColorCurveNeutral");
        state.uniforms.push("vCameraColorCurvePositive");
        state.uniforms.push("txColorTransform");
        state.uniforms.push("colorTransformSettings");
        // Emit code
        const color = this.color;
        const output = this._outputs[0];
        const comments = `//${this.name}`;
        state._emitFunctionFromInclude("helperFunctions", comments);
        state._emitFunctionFromInclude("imageProcessingDeclaration", comments);
        state._emitFunctionFromInclude("imageProcessingFunctions", comments);
        if (color.connectedPoint.type === NodeMaterialBlockConnectionPointTypes.Color4 || color.connectedPoint.type === NodeMaterialBlockConnectionPointTypes.Vector4) {
            state.compilationString += `${this._declareOutput(output, state)} = ${color.associatedVariableName};\r\n`;
        }
        else {
            state.compilationString += `${this._declareOutput(output, state)} = vec4(${color.associatedVariableName}, 1.0);\r\n`;
        }
        state.compilationString += `#ifdef IMAGEPROCESSINGPOSTPROCESS\r\n`;
        if (this.convertInputToLinearSpace) {
            state.compilationString += `${output.associatedVariableName}.rgb = toLinearSpace(${color.associatedVariableName}.rgb);\r\n`;
        }
        state.compilationString += `#else\r\n`;
        state.compilationString += `#ifdef IMAGEPROCESSING\r\n`;
        if (this.convertInputToLinearSpace) {
            state.compilationString += `${output.associatedVariableName}.rgb = toLinearSpace(${color.associatedVariableName}.rgb);\r\n`;
        }
        state.compilationString += `${output.associatedVariableName} = applyImageProcessing(${output.associatedVariableName});\r\n`;
        state.compilationString += `#endif\r\n`;
        state.compilationString += `#endif\r\n`;
        return this;
    }
    _dumpPropertiesCode() {
        let codeString = super._dumpPropertiesCode();
        codeString += `${this._codeVariableName}.convertInputToLinearSpace = ${this.convertInputToLinearSpace};\r\n`;
        return codeString;
    }
    serialize() {
        const serializationObject = super.serialize();
        serializationObject.convertInputToLinearSpace = this.convertInputToLinearSpace;
        return serializationObject;
    }
    _deserialize(serializationObject, scene, rootUrl) {
        var _a;
        super._deserialize(serializationObject, scene, rootUrl);
        this.convertInputToLinearSpace = (_a = serializationObject.convertInputToLinearSpace) !== null && _a !== void 0 ? _a : true;
    }
}
__decorate([
    editableInPropertyPage("Convert input to linear space", PropertyTypeForEdition.Boolean, "ADVANCED")
], ImageProcessingBlock.prototype, "convertInputToLinearSpace", void 0);
RegisterClass("BABYLON.ImageProcessingBlock", ImageProcessingBlock);
//# sourceMappingURL=imageProcessingBlock.js.map