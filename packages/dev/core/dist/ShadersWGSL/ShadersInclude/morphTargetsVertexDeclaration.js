// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "morphTargetsVertexDeclaration";
const shader = `#ifdef MORPHTARGETS
#ifndef MORPHTARGETS_TEXTURE
attribute position{X} : vec3<f32>;#ifdef MORPHTARGETS_NORMAL
attribute normal{X} : vec3<f32>;#endif
#ifdef MORPHTARGETS_TANGENT
attribute tangent{X} : vec3<f32>;#endif
#ifdef MORPHTARGETS_UV
attribute uv_{X} : vec2<f32>;#endif
#endif
#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export const morphTargetsVertexDeclaration = { name, shader };
//# sourceMappingURL=morphTargetsVertexDeclaration.js.map