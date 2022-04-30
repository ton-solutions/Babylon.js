// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "logDepthVertex";
const shader = `#ifdef LOGARITHMICDEPTH
vFragmentDepth=1.0+gl_Position.w;gl_Position.z=log2(max(0.000001,vFragmentDepth))*logarithmicDepthConstant;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const logDepthVertex = { name, shader };
//# sourceMappingURL=logDepthVertex.js.map