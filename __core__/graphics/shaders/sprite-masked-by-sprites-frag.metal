#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct SpriteMask
{
    float4x4 uvTransform;
    float2 uvMin;
    float2 uvMax;
    uint tint;
    uint extraData;
    float2 padding_;
};

struct spriteMaskUniforms
{
    float4 vertices[4];
    uint tint;
    uint extraData;
    uint numMasks;
    float padding_;
    SpriteMask masks[4];
};

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float4 vTint [[user(locn1)]];
    uint vExtra [[user(locn2)]];
    float2 vMask0UV [[user(locn3)]];
    float2 vMask1UV [[user(locn4)]];
    float2 vMask2UV [[user(locn5)]];
    float2 vMask3UV [[user(locn6)]];
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
        float _122;
        if (color.x < (0.5 * color.w))
        {
            _122 = x.x;
        }
        else
        {
            _122 = y.x;
        }
        color.x = _122;
        float _139;
        if (color.y < (0.5 * color.w))
        {
            _139 = x.y;
        }
        else
        {
            _139 = y.y;
        }
        color.y = _139;
        float _155;
        if (color.z < (0.5 * color.w))
        {
            _155 = x.z;
        }
        else
        {
            _155 = y.z;
        }
        color.z = _155;
        color.w = alpha;
    }
    if ((extra & 1u) != 0u)
    {
        float4 _172 = color;
        float3 _179 = float3(dot(_172.xyz, float3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _179.x;
        color.y = _179.y;
        color.z = _179.z;
    }
    return color;
}

static inline __attribute__((always_inline))
float4 getFragColor(thread const float4& color, thread const uint& extra)
{
    return select(color, float4(0.0), bool4((extra & 16u) != 0u));
}

static inline __attribute__((always_inline))
float4 textureMask(thread const int& maskIndex, texture2d<float> maskTex, sampler maskTexSmplr, thread const float2& uv, thread uint& vExtra, constant spriteMaskUniforms& _239)
{
    float clamp = ((step(_239.masks[maskIndex].uvMin.x, uv.x) * step(uv.x, _239.masks[maskIndex].uvMax.x)) * step(_239.masks[maskIndex].uvMin.y, uv.y)) * step(uv.y, _239.masks[maskIndex].uvMax.y);
    float4 maskColor = maskTex.sample(maskTexSmplr, uv);
    float4 tint = float4(float((_239.masks[maskIndex].tint >> uint(0)) & 255u), float((_239.masks[maskIndex].tint >> uint(8)) & 255u), float((_239.masks[maskIndex].tint >> uint(16)) & 255u), float((_239.masks[maskIndex].tint >> uint(24)) & 255u)) / float4(255.0);
    float4 param = maskColor;
    float4 param_1 = tint;
    uint param_2 = _239.masks[maskIndex].extraData;
    float4 _320 = applySpriteFlags(param, param_1, param_2, vExtra);
    float4 param_3 = _320;
    uint param_4 = vExtra;
    return getFragColor(param_3, param_4) * clamp;
}

static inline __attribute__((always_inline))
float4 blend(thread const float4& underColor, thread const float4& overColor)
{
    return overColor + (underColor * (1.0 - overColor.w));
}

static inline __attribute__((always_inline))
float4 applySpriteFlags(thread const float4& color, thread uint& vExtra, thread float4& vTint)
{
    float4 param = color;
    float4 param_1 = vTint;
    uint param_2 = vExtra;
    float4 _229 = applySpriteFlags(param, param_1, param_2, vExtra);
    return _229;
}

static inline __attribute__((always_inline))
float4 getLightColor(thread const float4& color, thread const uint& extra)
{
    float4 _193;
    if ((extra & 48u) != 0u)
    {
        _193 = float4(color.xyz, 0.0);
    }
    else
    {
        _193 = float4(0.0, 0.0, 0.0, color.w);
    }
    return _193;
}

fragment main0_out main0(main0_in in [[stage_in]], constant spriteMaskUniforms& _239 [[buffer(1)]], texture2d<float> tex [[texture(0)]], texture2d<float> mask0 [[texture(1)]], texture2d<float> mask1 [[texture(2)]], texture2d<float> mask2 [[texture(3)]], texture2d<float> mask3 [[texture(4)]], sampler texSmplr [[sampler(0)]], sampler mask0Smplr [[sampler(1)]], sampler mask1Smplr [[sampler(2)]], sampler mask2Smplr [[sampler(3)]], sampler mask3Smplr [[sampler(4)]])
{
    main0_out out = {};
    float4 maskColor = float4(0.0);
    if (_239.numMasks >= 1u)
    {
        int param = 0;
        float2 param_1 = in.vMask0UV;
        maskColor = textureMask(param, mask0, mask0Smplr, param_1, in.vExtra, _239);
    }
    if (_239.numMasks >= 2u)
    {
        int param_2 = 1;
        float2 param_3 = in.vMask1UV;
        float4 param_4 = maskColor;
        float4 param_5 = textureMask(param_2, mask1, mask1Smplr, param_3, in.vExtra, _239);
        maskColor = blend(param_4, param_5);
    }
    if (_239.numMasks >= 3u)
    {
        int param_6 = 2;
        float2 param_7 = in.vMask2UV;
        float4 param_8 = maskColor;
        float4 param_9 = textureMask(param_6, mask2, mask2Smplr, param_7, in.vExtra, _239);
        maskColor = blend(param_8, param_9);
    }
    if (_239.numMasks >= 4u)
    {
        int param_10 = 3;
        float2 param_11 = in.vMask3UV;
        float4 param_12 = maskColor;
        float4 param_13 = textureMask(param_10, mask3, mask3Smplr, param_11, in.vExtra, _239);
        maskColor = blend(param_12, param_13);
    }
    float4 spriteColor = tex.sample(texSmplr, in.vUV);
    float4 param_14 = spriteColor;
    float4 color = applySpriteFlags(param_14, in.vExtra, in.vTint);
    float4 param_15 = color;
    float4 param_16 = maskColor;
    color = blend(param_15, param_16);
    bool _414 = maskColor.w < 1.0;
    bool _420;
    if (_414)
    {
        _420 = spriteColor.w > 0.0;
    }
    else
    {
        _420 = _414;
    }
    color *= float(_420);
    float4 param_17 = color;
    uint param_18 = in.vExtra;
    out.fragColor = getFragColor(param_17, param_18);
    float4 param_19 = color;
    uint param_20 = in.vExtra;
    out.lightColor = getLightColor(param_19, param_20);
    return out;
}

