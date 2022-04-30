// Do not edit.
import { ShaderStore } from "../Engines/shaderStore";
const name = "circleOfConfusionPixelShader";
const shader = `uniform sampler2D depthSampler;varying vec2 vUV;uniform vec2 cameraMinMaxZ;uniform float focusDistance;uniform float cocPrecalculation;#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void){float depth=texture2D(depthSampler,vUV).r;float pixelDistance=(cameraMinMaxZ.x+(cameraMinMaxZ.y-cameraMinMaxZ.x)*depth)*1000.0; float coc=abs(cocPrecalculation* ((focusDistance-pixelDistance)/pixelDistance));coc=clamp(coc,0.0,1.0);gl_FragColor=vec4(coc,depth,coc,1.0);}`;
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export const circleOfConfusionPixelShader = { name, shader };
//# sourceMappingURL=circleOfConfusion.fragment.js.map