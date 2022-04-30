// Do not edit.
import { ShaderStore } from "../Engines/shaderStore";
const name = "clearQuadPixelShader";
const shader = `uniform vec4 color;void main() {gl_FragColor=color;}`;
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export const clearQuadPixelShader = { name, shader };
//# sourceMappingURL=clearQuad.fragment.js.map