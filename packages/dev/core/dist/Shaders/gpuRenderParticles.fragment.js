// Do not edit.
import { ShaderStore } from "../Engines/shaderStore";
import "./ShadersInclude/clipPlaneFragmentDeclaration2";
import "./ShadersInclude/imageProcessingDeclaration";
import "./ShadersInclude/helperFunctions";
import "./ShadersInclude/imageProcessingFunctions";
import "./ShadersInclude/clipPlaneFragment";
const name = "gpuRenderParticlesPixelShader";
const shader = `precision highp float;uniform sampler2D diffuseSampler;varying vec2 vUV;varying vec4 vColor;#include<clipPlaneFragmentDeclaration2> 
#include<imageProcessingDeclaration>
#include<helperFunctions>
#include<imageProcessingFunctions>
void main() {#include<clipPlaneFragment> 
vec4 textureColor=texture2D(diffuseSampler,vUV);gl_FragColor=textureColor*vColor;#ifdef BLENDMULTIPLYMODE
float alpha=vColor.a*textureColor.a;gl_FragColor.rgb=gl_FragColor.rgb*alpha+vec3(1.0)*(1.0-alpha);#endif 
#ifdef IMAGEPROCESSINGPOSTPROCESS
gl_FragColor.rgb=toLinearSpace(gl_FragColor.rgb);#else
#ifdef IMAGEPROCESSING
gl_FragColor.rgb=toLinearSpace(gl_FragColor.rgb);gl_FragColor=applyImageProcessing(gl_FragColor);#endif
#endif
}`;
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export const gpuRenderParticlesPixelShader = { name, shader };
//# sourceMappingURL=gpuRenderParticles.fragment.js.map