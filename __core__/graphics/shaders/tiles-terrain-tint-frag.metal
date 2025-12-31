#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

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

struct main0_out
{
    float4 fragColor [[color(0)]];
};

static inline __attribute__((always_inline))
float4 _textureOffset(texture2d<float> textureInput, sampler textureInputSmplr, thread const float2& uv, thread const float& offset, thread const float& scaleU, thread const float& scaleV)
{
    float4 outputTexture = textureInput.sample(textureInputSmplr, float2((uv.x + offset) * scaleU, (uv.y + offset) * scaleV));
    return outputTexture;
}

fragment main0_out main0(constant EffectUniforms& _27 [[buffer(0)]], texture2d<float> noiseTexture [[texture(0)]], sampler noiseTextureSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float2 map_Position = (_27.mapPosition + (gl_FragCoord.xy / float2(32.0 * _27.zoom))) * 32.0;
    float2 adjustedUV = map_Position / float2(1024.0);
    float2 uv = adjustedUV;
    float2 param = uv;
    float param_1 = _27.offset.x;
    float param_2 = _27.scaleU.x * _27.globalScale;
    float param_3 = _27.scaleV.x * _27.globalScale;
    float redTint = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param, param_1, param_2, param_3).x, 0.0, 1.0);
    float2 param_4 = uv;
    float param_5 = _27.offset.y;
    float param_6 = _27.scaleU.y * _27.globalScale;
    float param_7 = _27.scaleV.y * _27.globalScale;
    float greenTint = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_4, param_5, param_6, param_7).y, 0.0, 1.0);
    float2 param_8 = uv;
    float param_9 = _27.offset.z;
    float param_10 = _27.scaleU.z * _27.globalScale;
    float param_11 = _27.scaleV.z * _27.globalScale;
    float blueTint = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_8, param_9, param_10, param_11).z, 0.0, 1.0);
    float2 param_12 = uv;
    float param_13 = _27.offset.w;
    float param_14 = _27.scaleU.w * _27.globalScale;
    float param_15 = _27.scaleV.w * _27.globalScale;
    float Tint = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_12, param_13, param_14, param_15).y, 0.0, 1.0);
    float2 param_16 = uv;
    float param_17 = _27.offset.x;
    float param_18 = (_27.scaleU.x * _27.globalScale) * _27.zoomFactor;
    float param_19 = (_27.scaleV.x * _27.globalScale) * _27.zoomFactor;
    float redTint_half = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_16, param_17, param_18, param_19).x, 0.0, 1.0);
    float2 param_20 = uv;
    float param_21 = _27.offset.y;
    float param_22 = (_27.scaleU.y * _27.globalScale) * _27.zoomFactor;
    float param_23 = (_27.scaleV.y * _27.globalScale) * _27.zoomFactor;
    float greenTint_half = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_20, param_21, param_22, param_23).y, 0.0, 1.0);
    float2 param_24 = uv;
    float param_25 = _27.offset.z;
    float param_26 = (_27.scaleU.z * _27.globalScale) * _27.zoomFactor;
    float param_27 = (_27.scaleV.z * _27.globalScale) * _27.zoomFactor;
    float blueTint_half = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_24, param_25, param_26, param_27).z, 0.0, 1.0);
    float2 param_28 = uv;
    float param_29 = _27.offset.w;
    float param_30 = (_27.scaleU.w * _27.globalScale) * _27.zoomFactor;
    float param_31 = (_27.scaleV.w * _27.globalScale) * _27.zoomFactor;
    float Tint_half = fast::clamp(_textureOffset(noiseTexture, noiseTextureSmplr, param_28, param_29, param_30, param_31).y, 0.0, 1.0);
    float zoom_mult = fast::clamp(_27.zoom * 1.0, 0.0, 1.0);
    blueTint = mix((blueTint * _27.intensity.z) * _27.globalIntensity, ((blueTint_half * _27.intensity.z) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    redTint = mix((redTint * _27.intensity.x) * _27.globalIntensity, ((redTint_half * _27.intensity.x) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    greenTint = mix((greenTint * _27.intensity.y) * _27.globalIntensity, ((greenTint_half * _27.intensity.y) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    Tint = mix((Tint * _27.intensity.w) * _27.globalIntensity, ((Tint_half * _27.intensity.w) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    float4 color = float4(1.0 - fast::max(fast::max(blueTint, greenTint), Tint), 1.0 - fast::max(fast::max(blueTint, redTint), Tint), 1.0 - fast::max(fast::max(greenTint, redTint), Tint), 1.0);
    out.fragColor = color;
    return out;
}

