// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "fogVertexDeclaration";
const shader = `#ifdef FOG
varying vec3 vFogDistance;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const fogVertexDeclaration = { name, shader };
//# sourceMappingURL=fogVertexDeclaration.js.map