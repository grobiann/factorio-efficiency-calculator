#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectUniforms
{
    float2 resolution;
    float2 backgroundOffset;
    float padding_0;
    float timeRaw;
    float uTime;
    float zoom;
    float4 uSpecularLightness;
    float4 uFoamColor;
    float animationSpeed;
    float animationScale;
    float darkThreshold;
    float reflectionThreshold;
    float specularThreshold;
    float daytimeAlpha;
    uint isPuddle;
    float lightmapAlpha;
    int2 noiseVariations;
    int2 imageVariations;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float4 maskUVs [[user(locn2)]];
};

static inline __attribute__((always_inline))
float2 PanningUvs(thread const float2& uv, thread const float& speedX, thread const float& speedY, thread float& time)
{
    float2 uvDist = uv;
    uvDist.x += sin((time * 200.0) / speedX);
    uvDist.y += sin((time * 200.0) / speedY);
    uvDist = float2(uvDist.x, uvDist.y);
    return uvDist;
}

static inline __attribute__((always_inline))
float2 SplatterUvs(thread const float2& uv, thread const float& scale)
{
    float2 scalar = uv * scale;
    float2 index = floor(scalar) - scalar;
    float offset1 = index.x;
    float offset2 = index.y + 3.0;
    float2 splatter = float2(offset1, offset2);
    return splatter;
}

static inline __attribute__((always_inline))
float2 random2(thread const float2& st)
{
    float2 s = float2(dot(st, float2(12.345600128173828125, 34.141498565673828125)), dot(st, float2(42.21540069580078125, 15.285400390625)));
    return fract(sin(s) * 45678.8984375);
}

static inline __attribute__((always_inline))
float2 getRandomVariationUV(thread const float2& uv, thread const float2& variations)
{
    float2 fUV = fract(uv);
    float2 iUV = floor(uv);
    float2 param = iUV;
    float2 r = floor(random2(param) * variations);
    float2 size = float2(1.0) / variations;
    float2 finalUV = (fUV * size) + (r * size);
    return finalUV;
}

static inline __attribute__((always_inline))
float4 fetchImageTexture(thread const float2& uvA, thread const float2& uvB, constant EffectUniforms& _54, texture2d<float> imageTexture, sampler imageTextureSmplr)
{
    float2 uv = mix(uvA, uvB, float2(_54.animationScale)) * 2.0;
    float2 param = uv;
    float2 param_1 = float2(_54.imageVariations);
    return imageTexture.sample(imageTextureSmplr, getRandomVariationUV(param, param_1));
}

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

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _54 [[buffer(0)]], texture2d<float> mask1Texture [[texture(0)]], texture2d<float> mask2Texture [[texture(1)]], texture2d<float> waterMaskTexture [[texture(2)]], texture2d<float> noiseTexture [[texture(3)]], texture2d<float> imageTexture [[texture(4)]], sampler mask1TextureSmplr [[sampler(0)]], sampler mask2TextureSmplr [[sampler(1)]], sampler waterMaskTextureSmplr [[sampler(2)]], sampler noiseTextureSmplr [[sampler(3)]], sampler imageTextureSmplr [[sampler(4)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float time = _54.uTime * 9.9999997473787516355514526367188e-06;
    float imageTexScale = 5.0;
    float3 effectMask = waterMaskTexture.read(uint2(int2(gl_FragCoord.xy)), 0).xyz;
    float4 foamColor = _54.uFoamColor * 10.0;
    float4 specularLightness = _54.uSpecularLightness * 10.0;
    float intensity = _54.animationScale;
    float2 uv = in.vUV * 1.0;
    float2 noise_uv = uv * _54.reflectionThreshold;
    float speedbase = 10.0 * _54.animationSpeed;
    float Udir2 = speedbase / specularLightness.x;
    float Vdir2 = speedbase / specularLightness.y;
    float Udir = speedbase / foamColor.x;
    float Vdir = speedbase / foamColor.y;
    float2 param = noise_uv;
    float param_1 = Udir;
    float param_2 = Vdir;
    float2 warpUV1 = PanningUvs(param, param_1, param_2, time);
    float2 param_3 = noise_uv;
    float param_4 = Udir2;
    float param_5 = Vdir2;
    float2 warpUV2 = PanningUvs(param_3, param_4, param_5, time);
    float2 param_6 = noise_uv;
    float param_7 = Udir2 / 3.0;
    float param_8 = Vdir2 / 3.0;
    float2 warpUV3 = PanningUvs(param_6, param_7, param_8, time);
    float4 noise_1 = noiseTexture.sample(noiseTextureSmplr, warpUV1);
    float4 noise_2 = noiseTexture.sample(noiseTextureSmplr, warpUV2);
    float4 noise_4 = noiseTexture.sample(noiseTextureSmplr, warpUV2);
    float u = noise_1.x;
    float v = noise_2.x;
    float u2 = noise_1.y;
    float v2 = noise_2.y;
    float u3 = noise_4.x;
    float v3 = noise_4.y;
    float2 uv_1 = mix(float2(u, v), uv, float2(intensity));
    float2 uv_2 = mix(float2(v, u), uv, float2(intensity));
    float2 uv_3 = mix(float2(v2, u), uv, float2(intensity));
    float2 uv_4 = float2(v2, u2);
    float4 noise_3 = noiseTexture.sample(noiseTextureSmplr, ((uv_2 * 3.0) + uv_4));
    float3 debug = float3(noise_3.z);
    float4 noise_5 = noiseTexture.sample(noiseTextureSmplr, ((float2(u3, v3) * 0.5) + uv_4));
    noise_3 *= noise_5;
    float2 param_9 = in.vUV;
    float param_10 = 2.0;
    float4 tex_1 = imageTexture.sample(imageTextureSmplr, SplatterUvs(param_9, param_10));
    float2 param_11 = in.vUV;
    float param_12 = 3.0;
    float4 tex_2 = imageTexture.sample(imageTextureSmplr, SplatterUvs(param_11, param_12));
    float2 param_13 = uv_1;
    float2 param_14 = uv + float2(0.300000011920928955078125);
    float2 param_15 = uv_2;
    float2 param_16 = uv;
    float4 finalimage = mix(fetchImageTexture(param_13, param_14, _54, imageTexture, imageTextureSmplr), fetchImageTexture(param_15, param_16, _54, imageTexture, imageTextureSmplr), float4(fast::clamp(noise_3.z, 0.0, 1.0)));
    float4 colour = float4(0.0);
    float2 _477 = (finalimage.xy * (0.75 * _54.specularThreshold)) * float2(2.0 * effectMask.z, effectMask.z);
    colour.x = _477.x;
    colour.y = _477.y;
    float4 _493 = colour;
    float2 _495 = _493.xy + (float2(effectMask.z, 0.5 * effectMask.z) * (0.75 * _54.darkThreshold));
    colour.x = _495.x;
    colour.y = _495.y;
    colour += finalimage;
    colour *= (1.0 - effectMask.y);
    float4 param_17 = in.maskUVs;
    float param_18 = _54.timeRaw;
    float maskValue = fetchMaskTexture(mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, param_17, param_18);
    out.fragColor = colour * maskValue;
    float light = fast::max(colour.x, fast::max(colour.y, colour.z));
    light = fast::clamp(light + ((colour.x + colour.y) + colour.z), 0.0, 1.0);
    out.lightColor = float4(light, light * 0.699999988079071044921875, light * 0.5, _54.lightmapAlpha) * maskValue;
    return out;
}

