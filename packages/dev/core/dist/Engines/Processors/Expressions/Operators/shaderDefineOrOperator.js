import { ShaderDefineExpression } from "../shaderDefineExpression";
/** @hidden */
export class ShaderDefineOrOperator extends ShaderDefineExpression {
    isTrue(preprocessors) {
        return this.leftOperand.isTrue(preprocessors) || this.rightOperand.isTrue(preprocessors);
    }
}
//# sourceMappingURL=shaderDefineOrOperator.js.map