// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "mrtFragmentDeclaration";
const shader = `#if defined(WEBGL2) || defined(WEBGPU)
layout(location=0) out vec4 glFragData[{X}];
#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const mrtFragmentDeclaration = { name, shader };
//# sourceMappingURL=mrtFragmentDeclaration.js.map