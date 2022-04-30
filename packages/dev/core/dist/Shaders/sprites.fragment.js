// Do not edit.
import { ShaderStore } from "../Engines/shaderStore";
import "./ShadersInclude/fogFragmentDeclaration";
import "./ShadersInclude/fogFragment";
import "./ShadersInclude/imageProcessingCompatibility";
const name = "spritesPixelShader";
const shader = `uniform bool alphaTest;varying vec4 vColor;varying vec2 vUV;uniform sampler2D diffuseSampler;#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {#define CUSTOM_FRAGMENT_MAIN_BEGIN
vec4 color=texture2D(diffuseSampler,vUV);if (alphaTest) {if (color.a<0.95)discard;}color*=vColor;#include<fogFragment>
gl_FragColor=color;#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export const spritesPixelShader = { name, shader };
//# sourceMappingURL=sprites.fragment.js.map