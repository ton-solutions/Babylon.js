// Do not edit.
import { ShaderStore } from "../../Engines/shaderStore";
const name = "kernelBlurVertex";
const shader = `sampleCoord{X}=sampleCenter+delta*KERNEL_OFFSET{X};`;
// Sideeffect
ShaderStore.IncludesShadersStore[name] = shader;
/** @hidden */
export const kernelBlurVertex = { name, shader };
//# sourceMappingURL=kernelBlurVertex.js.map