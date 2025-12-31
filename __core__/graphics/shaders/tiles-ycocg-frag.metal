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
    float _137;
    if ((flags & 64u) == 0u)
    {
        _137 = color.w;
    }
    else
    {
        _137 = 0.0;
    }
    return float4(0.0, 0.0, 0.0, _137);
}

fragment main0_out main0(main0_in in [[stage_in]], constant passParams& _232 [[buffer(1)]], texture2d<float> atlasTexture [[texture(0)]], texture2d<float> mask1Texture [[texture(1)]], texture2d<float> mask2Texture [[texture(2)]], texture2d<float> atlasAlpha [[texture(3)]], sampler atlasTextureSmplr [[sampler(0)]], sampler mask1TextureSmplr [[sampler(1)]], sampler mask2TextureSmplr [[sampler(2)]], sampler atlasAlphaSmplr [[sampler(3)]])
{
    main0_out out = {};
    float4 yCoCg = atlasTexture.sample(atlasTextureSmplr, in.vUV);
    float alpha = atlasAlpha.sample(atlasAlphaSmplr, in.vUV).x;
    float4 param = in.maskUVs;
    float param_1 = _232.passTime;
    float mask = fetchMaskTexture(mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, param, param_1);
    float4 param_2 = yCoCg;
    float param_3 = alpha;
    float4 color = YCoCgToRGB(param_2, param_3) * mask;
    float4 param_4 = color;
    float3 param_5 = in.vTint;
    uint param_6 = in.vFlags;
    out.fragColor = getFragColor(param_4, param_5, param_6);
    float4 param_7 = color;
    float param_8 = mask;
    uint param_9 = in.vFlags;
    out.lightColor = getLightColor(param_7, param_8, param_9);
    return out;
}

