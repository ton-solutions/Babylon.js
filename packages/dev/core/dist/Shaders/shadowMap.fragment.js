// Do not edit.
import { ShaderStore } from "../Engines/shaderStore";
import "./ShadersInclude/shadowMapFragmentExtraDeclaration";
import "./ShadersInclude/clipPlaneFragmentDeclaration";
import "./ShadersInclude/clipPlaneFragment";
import "./ShadersInclude/shadowMapFragment";
const name = "shadowMapPixelShader";
const shader = `#include<shadowMapFragmentExtraDeclaration>
#ifdef ALPHATEST
varying vec2 vUV;uniform sampler2D diffuseSampler;#endif
#include<clipPlaneFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void){#include<clipPlaneFragment>
#ifdef ALPHATEST
float alphaFromAlphaTexture=texture2D(diffuseSampler,vUV).a;if (alphaFromAlphaTexture<ALPHATESTVALUE)discard;#endif
#if SM_SOFTTRANSPARENTSHADOW==1
#ifdef ALPHATEST
if ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM*alphaFromAlphaTexture) discard;#else
if ((bayerDither8(floor(mod(gl_FragCoord.xy,8.0))))/64.0>=softTransparentShadowSM) discard;#endif
#endif
#include<shadowMapFragment>
}`;
// Sideeffect
ShaderStore.ShadersStore[name] = shader;
/** @hidden */
export const shadowMapPixelShader = { name, shader };
//# sourceMappingURL=shadowMap.fragment.js.map