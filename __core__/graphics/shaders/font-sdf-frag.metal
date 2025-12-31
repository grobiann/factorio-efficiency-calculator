#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float borderWidthInPixels;
    float onEdgeValue;
    float pixelDistScale;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float4 vColor [[user(locn1), flat]];
    float4 vBorderColor [[user(locn2), flat]];
};

static inline __attribute__((always_inline))
float getIntensity(thread const float& borderWidth, thread const float& smoothing, thread const float2& uv, texture2d<float> atlasTexture, sampler atlasTextureSmplr, constant fsConstants& _31)
{
    float sdfValue = atlasTexture.sample(atlasTextureSmplr, uv).x;
    float intensity = smoothstep((_31.onEdgeValue - borderWidth) - smoothing, (_31.onEdgeValue - borderWidth) + smoothing, sdfValue);
    return intensity;
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _31 [[buffer(0)]], texture2d<float> atlasTexture [[texture(0)]], sampler atlasTextureSmplr [[sampler(0)]])
{
    main0_out out = {};
    float borderWidth = _31.borderWidthInPixels * _31.pixelDistScale;
    float smoothing = _31.pixelDistScale * 0.5;
    float4 useColor = in.vColor;
    float param = borderWidth;
    float param_1 = smoothing;
    float2 param_2 = in.vUV;
    float intensity = getIntensity(param, param_1, param_2, atlasTexture, atlasTextureSmplr, _31);
    float dscale = 0.100000001490116119384765625;
    float2 duv = (dfdx(in.vUV) + dfdy(in.vUV)) * dscale;
    float param_3 = borderWidth;
    float param_4 = smoothing;
    float2 param_5 = in.vUV + float2(duv.x, duv.y);
    float a = getIntensity(param_3, param_4, param_5, atlasTexture, atlasTextureSmplr, _31);
    float param_6 = borderWidth;
    float param_7 = smoothing;
    float2 param_8 = in.vUV + float2(duv.x, -duv.y);
    float b = getIntensity(param_6, param_7, param_8, atlasTexture, atlasTextureSmplr, _31);
    float param_9 = borderWidth;
    float param_10 = smoothing;
    float2 param_11 = in.vUV + float2(-duv.x, duv.y);
    float c = getIntensity(param_9, param_10, param_11, atlasTexture, atlasTextureSmplr, _31);
    float param_12 = borderWidth;
    float param_13 = smoothing;
    float2 param_14 = in.vUV + float2(-duv.x, -duv.y);
    float d = getIntensity(param_12, param_13, param_14, atlasTexture, atlasTextureSmplr, _31);
    float avg = (((a + b) + c) + d) / 4.0;
    intensity = mix(intensity, avg, 0.5);
    float4 useBorderColor = select(useColor, in.vBorderColor, bool4(borderWidth > 0.0));
    float sdfValue = atlasTexture.sample(atlasTextureSmplr, in.vUV).x;
    float borderIntensity = smoothstep(_31.onEdgeValue - smoothing, _31.onEdgeValue + smoothing, sdfValue);
    useColor = mix(useBorderColor, useColor, float4(borderIntensity));
    out.fragColor = useColor * intensity;
    return out;
}

