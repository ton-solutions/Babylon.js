// Do not edit.
import { ShaderStore } from "../Engines/shaderStore";
import "./ShadersInclude/helperFunctions";
const name = "rgbdDecodePixelShader";
const shader = `varying vec2 vUV;uniform sampler2D textureSampler;#include<helperFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {gl_FragColor=vec4(fromRGBD(texture2D(textureSampler,vUV)),1.0);}`;
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export const rgbdDecodePixelShader = { name, shader };
//# sourceMappingURL=rgbdDecode.fragment.js.map