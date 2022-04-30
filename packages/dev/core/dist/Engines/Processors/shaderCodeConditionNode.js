import { ShaderCodeNode } from "./shaderCodeNode";
/** @hidden */
export class ShaderCodeConditionNode extends ShaderCodeNode {
    process(preprocessors, options) {
        for (let index = 0; index < this.children.length; index++) {
            const node = this.children[index];
            if (node.isValid(preprocessors)) {
                return node.process(preprocessors, options);
            }
        }
        return "";
    }
}
//# sourceMappingURL=shaderCodeConditionNode.js.map