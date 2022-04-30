// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "fogFragment";
const shader = `#ifdef FOG
float fog=CalcFogFactor();#ifdef PBR
fog=toLinearSpace(fog);#endif
color.rgb=mix(vFogColor,color.rgb,fog);#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const fogFragment = { name, shader };
//# sourceMappingURL=fogFragment.js.map