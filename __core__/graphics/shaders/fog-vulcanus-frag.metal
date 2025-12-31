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
    float2 vUV [[user(locn0)]];
};

static inline __attribute__((always_inline))
float4 PanningTexture(thread const float2& uv, thread const float& speedX, thread const float& speedY, texture2d<float> textureInput, sampler textureInputSmplr, constant FogEffectUniforms& _43)
{
    float2 uvDist = ((uv * 2.0) + float2(_43.fracScaledTime)) + (_43.sinCosTimeHalf.yx / float2(speedX, speedY));
    float4 pannerOut = textureInput.sample(textureInputSmplr, uvDist);
    return pannerOut;
}

static inline __attribute__((always_inline))
float4 cloudsFunction(thread const float2& offset, thread const float& speed, thread float& globalScale, thread float& noiseTexScale, thread float& detailTexScale, constant FogEffectUniforms& _43, thread float& warpIntensity, thread float2& adjustedUV, thread float2& noise_uv, thread float& Udir, thread float& Vdir, thread float& Udir2, thread float& Vdir2, texture2d<float> noiseTexture, sampler noiseTextureSmplr, texture2d<float> detailTexture, sampler detailTextureSmplr)
{
    float globalSpeed = 1.0 * speed;
    float noisePanSpeed = 4.0 * globalSpeed;
    float globalPanSpeed = 30.0 * globalSpeed;
    float detailPanSpeed = 5.0 / globalSpeed;
    float2 param = (noise_uv * noiseTexScale) + offset;
    float param_1 = Udir * noisePanSpeed;
    float param_2 = Vdir * noisePanSpeed;
    float4 noise_1 = PanningTexture(param, param_1, param_2, noiseTexture, noiseTextureSmplr, _43);
    float2 param_3 = (noise_uv * noiseTexScale) + offset;
    float param_4 = Udir2 * noisePanSpeed;
    float param_5 = Vdir2 * noisePanSpeed;
    float4 noise_2 = PanningTexture(param_3, param_4, param_5, noiseTexture, noiseTextureSmplr, _43);
    float2 appendUvs = float2(noise_1.x, noise_2.y) * warpIntensity;
    float2 warpMix = mix(appendUvs, (adjustedUV * 0.4000000059604644775390625) + offset, float2(0.4000000059604644775390625));
    float2 param_6 = (warpMix * globalScale) + offset;
    float param_7 = Udir2 * globalPanSpeed;
    float param_8 = Vdir2 * globalPanSpeed;
    float4 globalPan = PanningTexture(param_6, param_7, param_8, detailTexture, detailTextureSmplr, _43);
    float2 param_9 = (noise_uv * detailTexScale) + offset;
    float param_10 = Udir / (detailPanSpeed * detailTexScale);
    float param_11 = Vdir / (detailPanSpeed * detailTexScale);
    float4 noiseOverlay1 = PanningTexture(param_9, param_10, param_11, detailTexture, detailTextureSmplr, _43);
    float2 param_12 = (noise_uv * detailTexScale) + offset;
    float param_13 = Udir2 / (detailPanSpeed * detailTexScale);
    float param_14 = Vdir2 / (detailPanSpeed * detailTexScale);
    float4 noiseOverlay2 = PanningTexture(param_12, param_13, param_14, detailTexture, detailTextureSmplr, _43);
    float4 noiseOverlay = mix(noiseOverlay1, noiseOverlay2, float4(0.5));
    float4 outputTexture = fast::clamp((noiseOverlay * 0.800000011920928955078125) * powr(globalPan.x, 8.0), float4(0.0), float4(1.0));
    return outputTexture;
}

static inline __attribute__((always_inline))
float4 combineColorAndLight(thread const float4& color, thread const float4& light)
{
    return float4(fast::clamp(color.xyz + fast::max(light.xyz, float3(0.0)), float3(0.0), float3(2.0)), 1.0);
}

fragment main0_out main0(main0_in in [[stage_in]], constant FogEffectUniforms& _43 [[buffer(0)]], texture2d<float> noiseTexture [[texture(0)]], texture2d<float> detailTexture [[texture(1)]], texture2d<float> lightmap [[texture(2)]], texture2d<float> fogMask [[texture(3)]], sampler noiseTextureSmplr [[sampler(0)]], sampler detailTextureSmplr [[sampler(1)]], sampler lightmapSmplr [[sampler(2)]], sampler fogMaskSmplr [[sampler(3)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float globalScale = 0.5;
    float noiseTexScale = 0.1500000059604644775390625;
    float detailTexScale = 0.20000000298023223876953125;
    float timeRandom = _43.timeBasedRandomValue;
    float2 adjustedCloudsOffset = fast::clamp(float2(_43.cloudsOffset.x, _43.cloudsOffset.y), float2(-3000.0), float2(2000.0));
    float4 direction1 = float4(adjustedCloudsOffset.x * 0.5, adjustedCloudsOffset.y * 1.5, 0.0, 0.0);
    float4 direction2 = float4(adjustedCloudsOffset.x, adjustedCloudsOffset.y, 0.0, 0.0);
    float4 direction3 = float4(0.03125, 0.007610999979078769683837890625, 0.02798300050199031829833984375, 0.0);
    float warpIntensity = 0.100000001490116119384765625 / globalScale;
    float panScale = 2.0;
    float2 adjustedMapPosition = ((((in.vUV * _43.renderResolution) / float2(_43.renderScale)) + _43.pixelShift) / float2(32.0 * _43.zoom)) * 32.0;
    float2 adjustedUV = (adjustedMapPosition + adjustedCloudsOffset) / float2(1024.0);
    float2 uv = adjustedUV + float2(10.0);
    float2 noise_uv = uv * panScale;
    float speedbase = 10.0 * _43.animationSpeed;
    float Udir = speedbase / direction1.x;
    float Vdir = speedbase / direction1.y;
    float Udir2 = speedbase / direction2.x;
    float Vdir2 = speedbase / direction2.y;
    float4 light = lightmap.sample(lightmapSmplr, in.vUV);
    float intensity = fast::clamp(0.5 * timeRandom, 0.300000011920928955078125, 0.60000002384185791015625);
    float2 param = float2(-0.00999999977648258209228515625);
    float param_1 = 1.0;
    float4 shadowTexture = (((float4(0.0, 0.0, 0.0, fast::clamp((float4(1.0) - light) * 10.0, float4(0.0), float4(1.0)).x) * powr(cloudsFunction(param, param_1, globalScale, noiseTexScale, detailTexScale, _43, warpIntensity, adjustedUV, noise_uv, Udir, Vdir, Udir2, Vdir2, noiseTexture, noiseTextureSmplr, detailTexture, detailTextureSmplr).x, 1.0)) * _43.sunLightIntensity) * intensity) * 1.89999997615814208984375;
    float4 param_2 = _43.color1;
    float4 param_3 = light;
    float2 param_4 = float2(0.0);
    float param_5 = 1.0;
    float4 fogTexture1 = (combineColorAndLight(param_2, param_3) * cloudsFunction(param_4, param_5, globalScale, noiseTexScale, detailTexScale, _43, warpIntensity, adjustedUV, noise_uv, Udir, Vdir, Udir2, Vdir2, noiseTexture, noiseTextureSmplr, detailTexture, detailTextureSmplr).x) * intensity;
    float4 param_6 = _43.color2;
    float4 param_7 = light;
    float2 param_8 = float2(0.0500000007450580596923828125);
    float param_9 = 0.25;
    float4 fogTexture2 = ((combineColorAndLight(param_6, param_7) * cloudsFunction(param_8, param_9, globalScale, noiseTexScale, detailTexScale, _43, warpIntensity, adjustedUV, noise_uv, Udir, Vdir, Udir2, Vdir2, noiseTexture, noiseTextureSmplr, detailTexture, detailTextureSmplr).x) * intensity) * 0.5;
    float mask = 1.0 - fogMask.sample(fogMaskSmplr, (float2(gl_FragCoord.xy) / _43.renderResolution)).w;
    out.fragColor = ((shadowTexture + fogTexture1) + fogTexture2) * mask;
    return out;
}

