#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectUniforms
{
    float2 pixelShift;
    float2 mapPosition;
    float zoom;
    float daytimeAlphaButDoNotUseIt;
    float2 renderResolution;
    float4 offset;
    float4 intensity;
    float4 scaleU;
    float4 scaleV;
    float globalIntensity;
    float globalScale;
    float zoomFactor;
    float zoomIntensity;
};

struct passParams
{
    float passTime;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

fragment main0_out main0(constant EffectUniforms& _14 [[buffer(0)]], texture2d<float> noiseTexture [[texture(0)]], sampler noiseTextureSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float2 map_Position = (_14.mapPosition + (gl_FragCoord.xy / float2(32.0 * _14.zoom))) * 32.0;
    float2 adjustedUV = map_Position / float2(1024.0);
    float2 uv = adjustedUV;
    float puddleWidth = 0.07500000298023223876953125;
    float puddleThreshold = 0.550000011920928955078125;
    float puddleOpacity = 0.60000002384185791015625;
    float puddle = noiseTexture.sample(noiseTextureSmplr, uv).y;
    out.fragColor = float4(0.0, 1.0 - (fast::clamp(smoothstep(puddleThreshold - puddleWidth, puddleThreshold + puddleWidth, puddle), 0.0, 1.0) * puddleOpacity), 0.0, 0.0);
    return out;
}

