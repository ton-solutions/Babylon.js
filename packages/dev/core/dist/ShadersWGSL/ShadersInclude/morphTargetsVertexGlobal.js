// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "morphTargetsVertexGlobal";
const shader = `#ifdef MORPHTARGETS
#ifdef MORPHTARGETS_TEXTURE
var vertexID : f32;#endif
#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export const morphTargetsVertexGlobal = { name, shader };
//# sourceMappingURL=morphTargetsVertexGlobal.js.map