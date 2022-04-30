// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "meshUboDeclaration";
const shader = `#ifdef WEBGL2
uniform mat4 world;uniform float visibility;#else
layout(std140,column_major) uniform;uniform Mesh{mat4 world;float visibility;};#endif
#define WORLD_UBO
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const meshUboDeclaration = { name, shader };
//# sourceMappingURL=meshUboDeclaration.js.map