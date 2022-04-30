// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "pointCloudVertex";
const shader = `#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const pointCloudVertex = { name, shader };
//# sourceMappingURL=pointCloudVertex.js.map