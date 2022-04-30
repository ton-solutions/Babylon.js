// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
import "./sceneVertexDeclaration";
import "./meshVertexDeclaration";
const name = "shadowMapVertexDeclaration";
const shader = `#include<sceneVertexDeclaration>
#include<meshVertexDeclaration>
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const shadowMapVertexDeclaration = { name, shader };
//# sourceMappingURL=shadowMapVertexDeclaration.js.map