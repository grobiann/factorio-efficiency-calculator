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
    float2 vUV [[user(locn0)]];
    float4 vTint [[user(locn1)]];
    uint vExtra [[user(locn2)]];
};

static inline __attribute__((always_inline))
float4 YCoCgToRGB(thread const float4& ycocg, thread const float& alpha)
{
    float Y = ycocg.w;
    float scale = 1.0 / ((31.875 * ycocg.z) + 1.0);
    float Co = (ycocg.x - 0.501960813999176025390625) * scale;
    float Cg = (ycocg.y - 0.501960813999176025390625) * scale;
    float R = (Y + Co) - Cg;
    float G = Y + Cg;
    float B = (Y - Co) - Cg;
    return float4(R, G, B, alpha);
}

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
        float _157;
        if (color.x < (0.5 * color.w))
        {
            _157 = x.x;
        }
        else
        {
            _157 = y.x;
        }
        color.x = _157;
        float _173;
        if (color.y < (0.5 * color.w))
        {
            _173 = x.y;
        }
        else
        {
            _173 = y.y;
        }
        color.y = _173;
        float _189;
        if (color.z < (0.5 * color.w))
        {
            _189 = x.z;
        }
        else
        {
            _189 = y.z;
        }
        color.z = _189;
        color.w = alpha;
    }
    if ((extra & 1u) != 0u)
    {
        float4 _206 = color;
        float3 _213 = float3(dot(_206.xyz, float3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _213.x;
        color.y = _213.y;
        color.z = _213.z;
    }
    return color;
}

static inline __attribute__((always_inline))
float4 applySpriteFlags(thread const float4& color, thread uint& vExtra, thread float4& vTint)
{
    float4 param = color;
    float4 param_1 = vTint;
    uint param_2 = vExtra;
    float4 _263 = applySpriteFlags(param, param_1, param_2, vExtra);
    return _263;
}

static inline __attribute__((always_inline))
float4 getFragColor(thread const float4& color, thread const uint& extra)
{
    return select(color, float4(0.0), bool4((extra & 16u) != 0u));
}

static inline __attribute__((always_inline))
float4 getLightColor(thread const float4& color, thread const uint& extra)
{
    float4 _227;
    if ((extra & 48u) != 0u)
    {
        _227 = float4(color.xyz, 0.0);
    }
    else
    {
        _227 = float4(0.0, 0.0, 0.0, color.w);
    }
    return _227;
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex1 [[texture(0)]], texture2d<float> tex2 [[texture(1)]], texture2d<float> mask [[texture(2)]], sampler tex1Smplr [[sampler(0)]], sampler tex2Smplr [[sampler(1)]], sampler maskSmplr [[sampler(2)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float4 yCoCg = tex1.sample(tex1Smplr, in.vUV);
    float alpha = tex2.sample(tex2Smplr, in.vUV).x;
    float4 param = yCoCg;
    float param_1 = alpha;
    float4 color = YCoCgToRGB(param, param_1);
    float4 param_2 = color;
    color = applySpriteFlags(param_2, in.vExtra, in.vTint);
    color *= mask.read(uint2(int2(gl_FragCoord.xy)), 0);
    float4 param_3 = color;
    uint param_4 = in.vExtra;
    out.fragColor = getFragColor(param_3, param_4);
    float4 param_5 = color;
    uint param_6 = in.vExtra;
    out.lightColor = getLightColor(param_5, param_6);
    return out;
}

