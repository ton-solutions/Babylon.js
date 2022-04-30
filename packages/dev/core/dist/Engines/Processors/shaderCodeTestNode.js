import { ShaderCodeNode } from "./shaderCodeNode";
/** @hidden */
export class ShaderCodeTestNode extends ShaderCodeNode {
    isValid(preprocessors) {
        return this.testExpression.isTrue(preprocessors);
    }
}
//# sourceMappingURL=shaderCodeTestNode.js.map