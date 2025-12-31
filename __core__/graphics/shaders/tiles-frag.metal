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
    float4 maskUVs [[user(locn1)]];
    uint vFlags [[user(locn2)]];
    float3 vTint [[user(locn3)]];
};

static inline __attribute__((always_inline))
float fetchMaskTexture(texture2d<float> mask1Texture, sampler mask1TextureSmplr, texture2d<float> mask2Texture, sampler mask2TextureSmplr, thread const float4& maskUVs, thread const float& time)
{
    float mask = 1.0;
    float2 mask1UV = maskUVs.xy;
    float2 mask2UV = maskUVs.zw;
    if (mask1UV.x > (-1.0))
    {
        mask = mask1Texture.sample(mask1TextureSmplr, mask1UV).x;
        if (mask2UV.x > (-1.0))
        {
            mask *= mask2Texture.sample(mask2TextureSmplr, mask2UV).x;
        }
        else
        {
            if (mask2UV.x <= (-2.0))
            {
                float timeScale = (-mask2UV.x) - 2.0;
                float wave = (sin((time * timeScale) + mask2UV.y) + 1.0) * 0.357142865657806396484375;
                mask = 1.0 - smoothstep(wave, wave + 0.300000011920928955078125, 1.0 - mask);
            }
        }
    }
    return mask;
}

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
    float _83;
    if ((flags & 64u) == 0u)
    {
        _83 = color.w;
    }
    else
    {
        _83 = 0.0;
    }
    return float4(0.0, 0.0, 0.0, _83);
}

fragment main0_out main0(main0_in in [[stage_in]], constant passParams& _167 [[buffer(1)]], texture2d<float> atlasTexture [[texture(0)]], texture2d<float> mask1Texture [[texture(1)]], texture2d<float> mask2Texture [[texture(2)]], sampler atlasTextureSmplr [[sampler(0)]], sampler mask1TextureSmplr [[sampler(1)]], sampler mask2TextureSmplr [[sampler(2)]])
{
    main0_out out = {};
    float4 param = in.maskUVs;
    float param_1 = _167.passTime;
    float mask = fetchMaskTexture(mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, param, param_1);
    float4 color = atlasTexture.sample(atlasTextureSmplr, in.vUV) * mask;
    float4 param_2 = color;
    float3 param_3 = in.vTint;
    uint param_4 = in.vFlags;
    out.fragColor = getFragColor(param_2, param_3, param_4);
    float4 param_5 = color;
    float param_6 = mask;
    uint param_7 = in.vFlags;
    out.lightColor = getLightColor(param_5, param_6, param_7);
    return out;
}

