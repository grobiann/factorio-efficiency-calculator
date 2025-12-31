#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct passParams
{
    float passTime;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    uint vFlags [[user(locn1)]];
    float3 vTint [[user(locn2)]];
};

static inline __attribute__((always_inline))
float4 getFragColor(thread const float4& color, thread const float3& tint, thread const uint& flags)
{
    float4 finalColor = float4(color.xyz * tint, color.w);
    return select(finalColor, float4(0.0), bool4((flags & 4u) != 0u));
}

static inline __attribute__((always_inline))
float4 getLightColor(thread const float4& color, thread const float& mask, thread const uint& flags)
{
    if ((flags & 36u) != 0u)
    {
        return float4(color.xyz * (mask * mask), 0.0);
    }
    float _73;
    if ((flags & 64u) == 0u)
    {
        _73 = color.w;
    }
    else
    {
        _73 = 0.0;
    }
    return float4(0.0, 0.0, 0.0, _73);
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> atlasTexture [[texture(0)]], texture2d<float> mask1Texture [[texture(1)]], sampler atlasTextureSmplr [[sampler(0)]], sampler mask1TextureSmplr [[sampler(1)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float mask = mask1Texture.sample(mask1TextureSmplr, ((gl_FragCoord.xy * 0.25) / float2(int2(mask1Texture.get_width(), mask1Texture.get_height()))), level(0.0)).w;
    mask = mix(float(((in.vFlags & 65280u) >> uint(8)) >> uint(1)) / 127.0, 1.0, mask);
    if ((in.vFlags & 256u) == 0u)
    {
        mask = 1.0;
    }
    float4 color = atlasTexture.sample(atlasTextureSmplr, in.vUV) * mask;
    float4 param = color;
    float3 param_1 = in.vTint;
    uint param_2 = in.vFlags;
    out.fragColor = getFragColor(param, param_1, param_2);
    float4 param_3 = color;
    float param_4 = 1.0;
    uint param_5 = in.vFlags;
    out.lightColor = getLightColor(param_3, param_4, param_5);
    return out;
}

