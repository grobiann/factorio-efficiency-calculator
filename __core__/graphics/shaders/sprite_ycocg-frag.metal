#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 fragColor [[color(0)]];
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
float3 colorToLut16Index(thread const float3& inputColor)
{
    return (inputColor * 0.9375) + float3(0.03125);
}

static inline __attribute__((always_inline))
float4 applySpriteFlags(thread float4& color, thread const float4& tint, thread const uint& extra, thread uint& vExtra, texture3d<float> lut, sampler lutSmplr)
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
        float _112;
        if (color.x < (0.5 * color.w))
        {
            _112 = x.x;
        }
        else
        {
            _112 = y.x;
        }
        color.x = _112;
        float _129;
        if (color.y < (0.5 * color.w))
        {
            _129 = x.y;
        }
        else
        {
            _129 = y.y;
        }
        color.y = _129;
        float _145;
        if (color.z < (0.5 * color.w))
        {
            _145 = x.z;
        }
        else
        {
            _145 = y.z;
        }
        color.z = _145;
        color.w = alpha;
    }
    if (all(bool2((extra & 8u) != 0u, color.w > 0.0)))
    {
        float3 param = color.xyz;
        float3 _180 = lut.sample(lutSmplr, colorToLut16Index(param), level(0.0)).xyz;
        color.x = _180.x;
        color.y = _180.y;
        color.z = _180.z;
    }
    if ((extra & 1u) != 0u)
    {
        float4 _192 = color;
        float3 _199 = float3(dot(_192.xyz, float3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _199.x;
        color.y = _199.y;
        color.z = _199.z;
    }
    return color;
}

static inline __attribute__((always_inline))
float4 applySpriteFlags(thread const float4& color, thread uint& vExtra, texture3d<float> lut, sampler lutSmplr, thread float4& vTint)
{
    float4 param = color;
    float4 param_1 = vTint;
    uint param_2 = vExtra;
    float4 _217 = applySpriteFlags(param, param_1, param_2, vExtra, lut, lutSmplr);
    return _217;
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex1 [[texture(0)]], texture2d<float> tex2 [[texture(1)]], texture3d<float> lut [[texture(2)]], sampler tex1Smplr [[sampler(0)]], sampler tex2Smplr [[sampler(1)]], sampler lutSmplr [[sampler(2)]])
{
    main0_out out = {};
    float4 yCoCg = tex1.sample(tex1Smplr, in.vUV);
    float alpha = tex2.sample(tex2Smplr, in.vUV).x;
    float4 param = yCoCg;
    float param_1 = alpha;
    float4 param_2 = YCoCgToRGB(param, param_1);
    float4 color = applySpriteFlags(param_2, in.vExtra, lut, lutSmplr, in.vTint);
    out.fragColor = color;
    return out;
}

