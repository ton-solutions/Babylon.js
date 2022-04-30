// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "meshUboDeclaration";
const shader = `struct Mesh {world : mat4x4<f32>,visibility : f32,};var<uniform> mesh : Mesh;#define WORLD_UBO
`;
// Sideeffect
ShaderStore.IncludesShadersStoreWGSL[name] = shader;
/** @hidden */
export const meshUboDeclaration = { name, shader };
//# sourceMappingURL=meshUboDeclaration.js.map