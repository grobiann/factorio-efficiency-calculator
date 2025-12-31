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
    float time;
    float zoom;
    float4 specularLightness;
    float4 foamColor;
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
    float4 vColor [[user(locn1)]];
    float4 maskUVs [[user(locn2)]];
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
float noise_func(thread const float2& uv, texture2d<float> waterNoiseTexture, sampler waterNoiseTextureSmplr)
{
    return waterNoiseTexture.sample(waterNoiseTextureSmplr, uv).x;
}

static inline __attribute__((always_inline))
float2 mul(thread const float2& v, thread const float2x2& m)
{
    return v * m;
}

static inline __attribute__((always_inline))
float2 rotate(thread float2& uv, texture2d<float> waterNoiseTexture, sampler waterNoiseTextureSmplr)
{
    float2 param = uv * 2.0;
    uv += float2(noise_func(param, waterNoiseTexture, waterNoiseTextureSmplr) * 0.0199999995529651641845703125);
    float angle = 3.0;
    float sinRot = sin(angle);
    float cosRot = cos(angle);
    float2x2 rotation = float2x2(float2(cosRot, -sinRot), float2(sinRot, cosRot));
    float2 param_1 = uv;
    float2x2 param_2 = rotation;
    return mul(param_1, param_2);
}

static inline __attribute__((always_inline))
float fbm(thread float2& uv, thread const float& t, texture2d<float> waterNoiseTexture, sampler waterNoiseTextureSmplr)
{
    float f = 0.0;
    float total = 0.0;
    float mul_1 = 1.0;
    for (int i = 0; i < 3; i++)
    {
        float2 param = uv + float2((t * 0.0024999999441206455230712890625) * (1.0 - mul_1));
        f += (noise_func(param, waterNoiseTexture, waterNoiseTextureSmplr) * mul_1);
        total += mul_1;
        float2 param_1 = uv * 1.10000002384185791015625;
        float2 _196 = rotate(param_1, waterNoiseTexture, waterNoiseTextureSmplr);
        uv = _196;
        mul_1 *= 0.75;
    }
    return f / total;
}

static inline __attribute__((always_inline))
float4 MainPS(texture2d<float> waterNoiseTexture, sampler waterNoiseTextureSmplr, texture2d<float> mask1Texture, sampler mask1TextureSmplr, texture2d<float> mask2Texture, sampler mask2TextureSmplr, thread float4& maskUVs, constant EffectUniforms& _216, thread float2& vUV, texture2d<float> waterMaskTexture, sampler waterMaskTextureSmplr, thread float4& gl_FragCoord, thread float4& vColor)
{
    float4 param = maskUVs;
    float param_1 = _216.timeRaw;
    float tileTransitionMask = fetchMaskTexture(mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, param, param_1);
    float2 uv = vUV;
    uv.y *= 1.414000034332275390625;
    float2 param_2 = float2(sin(_216.time * _216.animationSpeed) * _216.animationScale) + uv;
    float param_3 = _216.time;
    float _253 = fbm(param_2, param_3, waterNoiseTexture, waterNoiseTextureSmplr);
    float value = _253 + 0.100000001490116119384765625;
    float3 mask = waterMaskTexture.read(uint2(int2(gl_FragCoord.xy)), 0).xyz;
    float darks = 1.0 - ceil(value + _216.darkThreshold);
    float reflection = smoothstep(0.0, _216.reflectionThreshold, ((1.0 - (value * 0.800000011920928955078125)) - 0.60000002384185791015625) + (mask.x * 0.25));
    float specular = fast::clamp(ceil((value + _216.specularThreshold) - mask.x), 1.0, 2.0);
    float4 color = float4(vColor.xyz * ((value + (specular * 0.189999997615814208984375)) - (mask.z * 0.300000011920928955078125)), vColor.w);
    color = mix(color, color * (_216.specularLightness * (-1.0)), float4(darks * 0.10999999940395355224609375));
    float3 color_reflect = mix(color.xyz, (color.xyz * color.xyz) * 1.5, float3(fast::clamp(reflection, 0.0, 0.5)));
    color = float4(color_reflect, color.w);
    color *= (1.0 - mask.y);
    color = mix(color, _216.foamColor, float4(smoothstep(-0.3499999940395355224609375, 0.300000011920928955078125, mask.z - (value * 2.150000095367431640625))));
    return color * tileTransitionMask;
}

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _216 [[buffer(0)]], texture2d<float> mask1Texture [[texture(0)]], texture2d<float> mask2Texture [[texture(1)]], texture2d<float> waterMaskTexture [[texture(2)]], texture2d<float> waterNoiseTexture [[texture(3)]], sampler mask1TextureSmplr [[sampler(0)]], sampler mask2TextureSmplr [[sampler(1)]], sampler waterMaskTextureSmplr [[sampler(2)]], sampler waterNoiseTextureSmplr [[sampler(3)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    out.fragColor = MainPS(waterNoiseTexture, waterNoiseTextureSmplr, mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, in.maskUVs, _216, in.vUV, waterMaskTexture, waterMaskTextureSmplr, gl_FragCoord, in.vColor);
    out.lightColor = float4(0.0, 0.0, 0.0, out.fragColor.w * _216.lightmapAlpha);
    return out;
}

