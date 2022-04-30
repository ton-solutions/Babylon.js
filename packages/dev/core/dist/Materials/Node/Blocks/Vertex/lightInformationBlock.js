import { NodeMaterialBlock } from "../../nodeMaterialBlock";
import { NodeMaterialBlockConnectionPointTypes } from "../../Enums/nodeMaterialBlockConnectionPointTypes";
import { NodeMaterialBlockTargets } from "../../Enums/nodeMaterialBlockTargets";
import { RegisterClass } from "../../../../Misc/typeStore";
import { PointLight } from "../../../../Lights/pointLight";
/**
 * Block used to get data information from a light
 */
export class LightInformationBlock extends NodeMaterialBlock {
    /**
     * Creates a new LightInformationBlock
     * @param name defines the block name
     */
    constructor(name) {
        super(name, NodeMaterialBlockTargets.Vertex);
        this.registerInput("worldPosition", NodeMaterialBlockConnectionPointTypes.Vector4, false, NodeMaterialBlockTargets.Vertex);
        this.registerOutput("direction", NodeMaterialBlockConnectionPointTypes.Vector3);
        this.registerOutput("color", NodeMaterialBlockConnectionPointTypes.Color3);
        this.registerOutput("intensity", NodeMaterialBlockConnectionPointTypes.Float);
    }
    /**
     * Gets the current class name
     * @returns the class name
     */
    getClassName() {
        return "LightInformationBlock";
    }
    /**
     * Gets the world position input component
     */
    get worldPosition() {
        return this._inputs[0];
    }
    /**
     * Gets the direction output component
     */
    get direction() {
        return this._outputs[0];
    }
    /**
     * Gets the direction output component
     */
    get color() {
        return this._outputs[1];
    }
    /**
     * Gets the direction output component
     */
    get intensity() {
        return this._outputs[2];
    }
    bind(effect, nodeMaterial, mesh) {
        if (!mesh) {
            return;
        }
        if (this.light && this.light.isDisposed) {
            this.light = null;
        }
        let light = this.light;
        const scene = nodeMaterial.getScene();
        if (!light && scene.lights.length) {
            light = this.light = scene.lights[0];
            this._forcePrepareDefines = true;
        }
        if (!light || !light.isEnabled) {
            effect.setFloat3(this._lightDataUniformName, 0, 0, 0);
            effect.setFloat4(this._lightColorUniformName, 0, 0, 0, 0);
            return;
        }
        light.transferToNodeMaterialEffect(effect, this._lightDataUniformName);
        effect.setColor4(this._lightColorUniformName, light.diffuse, light.intensity);
    }
    prepareDefines(mesh, nodeMaterial, defines) {
        if (!defines._areLightsDirty && !this._forcePrepareDefines) {
            return;
        }
        this._forcePrepareDefines = false;
        const light = this.light;
        defines.setValue(this._lightTypeDefineName, light && light instanceof PointLight ? true : false, true);
    }
    _buildBlock(state) {
        super._buildBlock(state);
        state.sharedData.bindableBlocks.push(this);
        state.sharedData.blocksWithDefines.push(this);
        const direction = this.direction;
        const color = this.color;
        const intensity = this.intensity;
        this._lightDataUniformName = state._getFreeVariableName("lightData");
        this._lightColorUniformName = state._getFreeVariableName("lightColor");
        this._lightTypeDefineName = state._getFreeDefineName("LIGHTPOINTTYPE");
        state._emitUniformFromString(this._lightDataUniformName, "vec3");
        state._emitUniformFromString(this._lightColorUniformName, "vec4");
        state.compilationString += `#ifdef ${this._lightTypeDefineName}\r\n`;
        state.compilationString += this._declareOutput(direction, state) + ` = normalize(${this.worldPosition.associatedVariableName}.xyz - ${this._lightDataUniformName});\r\n`;
        state.compilationString += `#else\r\n`;
        state.compilationString += this._declareOutput(direction, state) + ` = ${this._lightDataUniformName};\r\n`;
        state.compilationString += `#endif\r\n`;
        state.compilationString += this._declareOutput(color, state) + ` = ${this._lightColorUniformName}.rgb;\r\n`;
        state.compilationString += this._declareOutput(intensity, state) + ` = ${this._lightColorUniformName}.a;\r\n`;
        return this;
    }
    serialize() {
        const serializationObject = super.serialize();
        if (this.light) {
            serializationObject.lightId = this.light.id;
        }
        return serializationObject;
    }
    _deserialize(serializationObject, scene, rootUrl) {
        super._deserialize(serializationObject, scene, rootUrl);
        if (serializationObject.lightId) {
            this.light = scene.getLightById(serializationObject.lightId);
        }
    }
}
RegisterClass("BABYLON.LightInformationBlock", LightInformationBlock);
//# sourceMappingURL=lightInformationBlock.js.map