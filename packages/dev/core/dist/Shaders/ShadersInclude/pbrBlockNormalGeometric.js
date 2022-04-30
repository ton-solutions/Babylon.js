// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "pbrBlockNormalGeometric";
const shader = `vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);#ifdef NORMAL
vec3 normalW=normalize(vNormalW);#else
vec3 normalW=normalize(cross(dFdx(vPositionW),dFdy(vPositionW)))*vEyePosition.w;#endif
vec3 geometricNormalW=normalW;#if defined(TWOSIDEDLIGHTING) && defined(NORMAL)
geometricNormalW=gl_FrontFacing ? geometricNormalW : -geometricNormalW;#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const pbrBlockNormalGeometric = { name, shader };
//# sourceMappingURL=pbrBlockNormalGeometric.js.map