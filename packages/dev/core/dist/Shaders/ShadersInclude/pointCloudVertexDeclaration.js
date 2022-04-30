// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "pointCloudVertexDeclaration";
const shader = `#ifdef POINTSIZE
uniform float pointSize;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const pointCloudVertexDeclaration = { name, shader };
//# sourceMappingURL=pointCloudVertexDeclaration.js.map