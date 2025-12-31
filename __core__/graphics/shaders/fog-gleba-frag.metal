#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct FogEffectUniforms
{
    float2 renderResolution;
    float2 unused_TexSize;
    float2 pixelShift;
    float2 mapPosition;
    float zoom;
    uint debugOption;
    float2 cloudsOffset;
    float4 color1;
    float4 color2;
    float animationSpeed;
    float animationScale;
    float sunLightIntensity;
    float renderScale;
    uint uTick;
    float tickFactor;
    float2 scaledTime;
    float timeBasedRandomValue;
    float fracScaledTime;
    float2 sinCosTimeHalf;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vCellUV [[user(locn0)]];
    float4 vCornerIntensities [[user(locn2), flat]];
};

static inline __attribute__((always_inline))
float4 PanningTexture(thread const float2& uv, thread const float& speedX, thread const float& speedY, texture2d<float> textureInput, sampler textureInputSmplr, constant FogEffectUniforms& _46)
{
    float2 uvDist = ((uv * 2.0) + float2(_46.fracScaledTime)) + (_46.sinCosTimeHalf.yx / float2(speedX, speedY));
    float4 pannerOut = textureInput.sample(textureInputSmplr, uvDist);
    return pannerOut;
}

static inline __attribute__((always_inline))
float4 combineColorAndLight(thread const float4& color, thread const float4& light)
{
    return float4(fast::clamp(color.xyz * (color.xyz + fast::max(light.xyz, float3(0.0))), float3(0.0), float3(1.0)), 1.0);
}

static inline __attribute__((always_inline))
float4 cloudsFunction(thread const float2& offset, thread const float& speed, thread float& globalScale, thread float& noiseTexScale, thread float& detailTexScale, constant FogEffectUniforms& _46, thread float& warpIntensity, thread float2& adjustedUV, thread float2& noise_uv, thread float4& windRotationMask, texture2d<float> noiseTexture, sampler noiseTextureSmplr, thread float& Udir, thread float& Vdir, thread float& Udir2, thread float& Vdir2, texture2d<float> detailTexture, sampler detailTextureSmplr)
{
    float globalSpeed = 1.0 * speed;
    float noisePanSpeed = 50.0 * globalSpeed;
    float globalPanSpeed = 100.0 * globalSpeed;
    float detailPanSpeed = 0.100000001490116119384765625 * globalSpeed;
    float2 param = (noise_uv * noiseTexScale) + offset;
    float param_1 = Udir * noisePanSpeed;
    float param_2 = Vdir * noisePanSpeed;
    float4 noise_1 = PanningTexture(param, param_1, param_2, noiseTexture, noiseTextureSmplr, _46);
    float2 param_3 = (noise_uv * noiseTexScale) + offset;
    float param_4 = Udir2 * noisePanSpeed;
    float param_5 = Vdir2 * noisePanSpeed;
    float4 noise_2 = PanningTexture(param_3, param_4, param_5, noiseTexture, noiseTextureSmplr, _46);
    float2 appendUvs1 = float2(noise_1.x, noise_2.y) * (warpIntensity * 50.0);
    float2 appendUvs2 = float2(noise_1.y, noise_2.x) * (warpIntensity * 100.0);
    float2 appendUvs = mix(appendUvs1, appendUvs2, float2((_46.sinCosTimeHalf.x * _46.sinCosTimeHalf.y) * 2.0));
    float2 warpMix = mix(appendUvs, (adjustedUV * 0.4000000059604644775390625) + offset, float2(0.4000000059604644775390625));
    float2 param_6 = ((warpMix * 2.0) * globalScale) + offset;
    float param_7 = Udir2 * globalPanSpeed;
    float param_8 = Vdir2 * globalPanSpeed;
    float4 globalPan = PanningTexture(param_6, param_7, param_8, detailTexture, detailTextureSmplr, _46);
    float2 param_9 = (noise_uv * detailTexScale) + offset;
    float param_10 = Udir / (detailPanSpeed * detailTexScale);
    float param_11 = Vdir / (detailPanSpeed * detailTexScale);
    float4 noiseOverlay1 = PanningTexture(param_9, param_10, param_11, detailTexture, detailTextureSmplr, _46);
    float2 param_12 = (noise_uv * detailTexScale) + offset;
    float param_13 = Udir2 / (detailPanSpeed * detailTexScale);
    float param_14 = Vdir2 / (detailPanSpeed * detailTexScale);
    float4 noiseOverlay2 = PanningTexture(param_12, param_13, param_14, detailTexture, detailTextureSmplr, _46);
    float4 noiseOverlay = mix(noiseOverlay1, noiseOverlay2, float4(windRotationMask.y));
    globalPan = fast::clamp(globalPan - float4(0.5), float4(0.0), float4(1.0)) * 2.0;
    float4 outputTexture = fast::clamp(mix(globalPan * noiseOverlay, globalPan, float4(0.300000011920928955078125)), float4(0.0), float4(1.0));
    return outputTexture;
}

static inline __attribute__((always_inline))
float calculateLowlandIntensityBilinear(thread float4& vCornerIntensities, thread float2& vCellUV)
{
    float intensity = mix(mix(vCornerIntensities.x, vCornerIntensities.y, vCellUV.x), mix(vCornerIntensities.z, vCornerIntensities.w, vCellUV.x), vCellUV.y);
    return smoothstep(0.0, 0.75, intensity);
}

fragment main0_out main0(main0_in in [[stage_in]], constant FogEffectUniforms& _46 [[buffer(0)]], texture2d<float> noiseTexture [[texture(0)]], texture2d<float> detailTexture [[texture(1)]], texture2d<float> lightmap [[texture(2)]], texture2d<float> fogMask [[texture(3)]], sampler noiseTextureSmplr [[sampler(0)]], sampler detailTextureSmplr [[sampler(1)]], sampler lightmapSmplr [[sampler(2)]], sampler fogMaskSmplr [[sampler(3)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float globalScale = 0.100000001490116119384765625;
    float noiseTexScale = 0.1500000059604644775390625;
    float detailTexScale = 1.2000000476837158203125;
    float timeRandom = _46.timeBasedRandomValue;
    float2 adjustedCloudsOffset = fast::clamp(float2(_46.cloudsOffset.x, _46.cloudsOffset.y), float2(-3000.0), float2(2000.0));
    float4 direction1 = float4(adjustedCloudsOffset.x * 0.5, adjustedCloudsOffset.y * 1.5, 0.0, 0.0);
    float4 direction2 = float4(adjustedCloudsOffset.x, adjustedCloudsOffset.y, 0.0, 0.0);
    float4 direction3 = float4(0.03125, 0.007610999979078769683837890625, 0.02798300050199031829833984375, 0.0);
    float warpIntensity = 0.0074999998323619365692138671875 / globalScale;
    float panScale = 2.0;
    float2 adjustedMapPosition = (((float2(gl_FragCoord.xy) / float2(_46.renderScale)) + _46.pixelShift) / float2(32.0 * _46.zoom)) * 32.0;
    float2 adjustedUV = (adjustedMapPosition + adjustedCloudsOffset) / float2(1024.0);
    float2 uv = adjustedUV + float2(10.0);
    float2 noise_uv = uv * panScale;
    float speedbase = 0.5 * _46.animationSpeed;
    float2 param = uv / float2(100.0);
    float param_1 = adjustedCloudsOffset.x;
    float param_2 = adjustedCloudsOffset.y;
    float4 windRotationMask = PanningTexture(param, param_1, param_2, noiseTexture, noiseTextureSmplr, _46);
    float2 param_3 = (uv / float2(100.0)) + float2(0.20000000298023223876953125);
    float param_4 = adjustedCloudsOffset.x;
    float param_5 = adjustedCloudsOffset.y;
    float4 windRotationMask2 = PanningTexture(param_3, param_4, param_5, noiseTexture, noiseTextureSmplr, _46);
    float Udir = speedbase / direction1.x;
    float Vdir = speedbase / direction1.y;
    float Udir2 = speedbase / direction2.x;
    float Vdir2 = speedbase / direction2.y;
    float4 light = lightmap.sample(lightmapSmplr, (float2(gl_FragCoord.xy) / (_46.renderResolution / float2(_46.renderScale))));
    float4 color_1 = _46.color1;
    float4 color_2 = _46.color2;
    float intensity = fast::clamp(timeRandom, 0.4000000059604644775390625, 0.5) * 0.60000002384185791015625;
    float4 param_6 = color_1;
    float4 param_7 = light;
    float2 param_8 = float2(0.0);
    float param_9 = 1.0;
    float4 fogTexture1 = (combineColorAndLight(param_6, param_7) * mix(cloudsFunction(param_8, param_9, globalScale, noiseTexScale, detailTexScale, _46, warpIntensity, adjustedUV, noise_uv, windRotationMask, noiseTexture, noiseTextureSmplr, Udir, Vdir, Udir2, Vdir2, detailTexture, detailTextureSmplr).x, 0.800000011920928955078125, 0.300000011920928955078125)) * intensity;
    float4 param_10 = color_2;
    float4 param_11 = light;
    float2 param_12 = float2(0.0500000007450580596923828125);
    float param_13 = 0.25;
    float4 fogTexture2 = ((combineColorAndLight(param_10, param_11) * mix(cloudsFunction(param_12, param_13, globalScale, noiseTexScale, detailTexScale, _46, warpIntensity, adjustedUV, noise_uv, windRotationMask, noiseTexture, noiseTextureSmplr, Udir, Vdir, Udir2, Vdir2, detailTexture, detailTextureSmplr).x, 0.800000011920928955078125, 0.300000011920928955078125)) * intensity) * 0.5;
    float mask = 1.0 - fogMask.sample(fogMaskSmplr, (float2(gl_FragCoord.xy) / _46.renderResolution)).w;
    out.fragColor = ((fogTexture1 + fogTexture2) * mask) * calculateLowlandIntensityBilinear(in.vCornerIntensities, in.vCellUV);
    return out;
}

