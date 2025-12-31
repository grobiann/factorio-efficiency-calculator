#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV1 [[user(locn0)]];
    float2 vUV2 [[user(locn1)]];
    float4 vTint [[user(locn2)]];
    uint vExtra [[user(locn3)]];
    float vRatio [[user(locn4), flat]];
};

static inline __attribute__((always_inline))
float4 applySpriteFlags(thread float4& color, thread const float4& tint, thread const uint& extra, thread uint& vExtra)
{
    if ((vExtra & 4u) != 0u)
    {
        color = float4(color.www - color.xyz, color.w);
    }
    if ((vExtra & 2u) == 0u)
    {
        color *= tint;
    }
    else
    {
        float alpha = color.w * tint.w;
        float3 x = (color.xyz * tint.xyz) * 2.0;
        float3 y = float3(alpha) - (((float3(color.w) - color.xyz) * 2.0) * (float3(tint.w) - tint.xyz));
        float _104;
        if (color.x < (0.5 * color.w))
        {
            _104 = x.x;
        }
        else
        {
            _104 = y.x;
        }
        color.x = _104;
        float _121;
        if (color.y < (0.5 * color.w))
        {
            _121 = x.y;
        }
        else
        {
            _121 = y.y;
        }
        color.y = _121;
        float _137;
        if (color.z < (0.5 * color.w))
        {
            _137 = x.z;
        }
        else
        {
            _137 = y.z;
        }
        color.z = _137;
        color.w = alpha;
    }
    if ((extra & 1u) != 0u)
    {
        float4 _154 = color;
        float3 _161 = float3(dot(_154.xyz, float3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _161.x;
        color.y = _161.y;
        color.z = _161.z;
    }
    return color;
}

static inline __attribute__((always_inline))
float4 applySpriteFlags(thread const float4& color, thread uint& vExtra, thread float4& vTint)
{
    float4 param = color;
    float4 param_1 = vTint;
    uint param_2 = vExtra;
    float4 _211 = applySpriteFlags(param, param_1, param_2, vExtra);
    return _211;
}

static inline __attribute__((always_inline))
float4 getFragColor(thread const float4& color, thread const uint& extra)
{
    return select(color, float4(0.0), bool4((extra & 16u) != 0u));
}

static inline __attribute__((always_inline))
float4 getLightColor(thread const float4& color, thread const uint& extra)
{
    float4 _175;
    if ((extra & 48u) != 0u)
    {
        _175 = float4(color.xyz, 0.0);
    }
    else
    {
        _175 = float4(0.0, 0.0, 0.0, color.w);
    }
    return _175;
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex1 [[texture(0)]], texture2d<float> tex2 [[texture(1)]], sampler tex1Smplr [[sampler(0)]], sampler tex2Smplr [[sampler(1)]])
{
    main0_out out = {};
    float4 param = mix(tex1.sample(tex1Smplr, in.vUV1), tex2.sample(tex2Smplr, in.vUV2), float4(in.vRatio));
    float4 color = applySpriteFlags(param, in.vExtra, in.vTint);
    float4 param_1 = color;
    uint param_2 = in.vExtra;
    out.fragColor = getFragColor(param_1, param_2);
    float4 param_3 = color;
    uint param_4 = in.vExtra;
    out.lightColor = getLightColor(param_3, param_4);
    return out;
}

