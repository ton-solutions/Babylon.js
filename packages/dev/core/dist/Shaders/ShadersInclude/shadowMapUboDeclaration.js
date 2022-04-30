// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
import "./sceneUboDeclaration";
import "./meshUboDeclaration";
const name = "shadowMapUboDeclaration";
const shader = `layout(std140,column_major) uniform;#include<sceneUboDeclaration>
#include<meshUboDeclaration>
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const shadowMapUboDeclaration = { name, shader };
//# sourceMappingURL=shadowMapUboDeclaration.js.map