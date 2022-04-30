// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "uvAttributeDeclaration";
const shader = `#ifdef UV{X}
attribute vec2 uv{X};#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const uvAttributeDeclaration = { name, shader };
//# sourceMappingURL=uvAttributeDeclaration.js.map