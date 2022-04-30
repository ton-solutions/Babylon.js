// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "mainUVVaryingDeclaration";
const shader = `#ifdef MAINUV{X}
varying vec2 vMainUV{X};#endif
`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const mainUVVaryingDeclaration = { name, shader };
//# sourceMappingURL=mainUVVaryingDeclaration.js.map