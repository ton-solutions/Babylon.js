// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "logDepthDeclaration";
const shader = `#ifdef LOGARITHMICDEPTH
uniform float logarithmicDepthConstant;varying float vFragmentDepth;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const logDepthDeclaration = { name, shader };
//# sourceMappingURL=logDepthDeclaration.js.map