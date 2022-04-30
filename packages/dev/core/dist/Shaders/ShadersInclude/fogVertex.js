// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "fogVertex";
const shader = `#ifdef FOG
vFogDistance=(view*worldPos).xyz;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const fogVertex = { name, shader };
//# sourceMappingURL=fogVertex.js.map