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
    float4 vColor [[user(locn1)]];
    float4 maskUVs [[user(locn2)]];
};

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
float4 fetchImageTexture2(texture2d<float> tex, sampler texSmplr, thread const float2& uvA, thread const float2& uvB, constant EffectUniforms& _58)
{
    float2 uv = mix(uvA, uvB, float2(0.800000011920928955078125)) * 1.75;
    float2 param = uv;
    float2 param_1 = float2(_58.imageVariations);
    return tex.sample(texSmplr, getRandomVariationUV(param, param_1));
}

static inline __attribute__((always_inline))
float2 PanningUvs(thread const float2& uv, thread const float& speedX, thread const float& speedY, thread float& time)
{
    float2 uvDist = uv;
    uvDist.x += sin((time * 1000.0) / speedX);
    uvDist.y += sin((time * 1000.0) / speedY);
    uvDist = float2(uvDist.x, uvDist.y);
    return uvDist;
}

static inline __attribute__((always_inline))
float3 overlay(thread const float3& image_1, thread const float3& image_2, thread const float& opacity)
{
    float3 multiply = (image_1 * 2.0) * image_2;
    float3 screen = float3(1.0) - (((float3(1.0) - image_1) * 2.0) * (float3(1.0) - image_2));
    float threshold = step(dot(image_1, float3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)), 0.5);
    float3 result = mix(screen, multiply, float3(threshold));
    return mix(image_1, result, float3(opacity));
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

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _58 [[buffer(0)]], texture2d<float> mask1Texture [[texture(0)]], texture2d<float> mask2Texture [[texture(1)]], texture2d<float> waterMaskTexture [[texture(2)]], texture2d<float> noiseTexture [[texture(3)]], texture2d<float> imageTexture [[texture(4)]], texture2d<float> gradientTexture [[texture(5)]], texture2d<float> normalTexture [[texture(6)]], sampler mask1TextureSmplr [[sampler(0)]], sampler mask2TextureSmplr [[sampler(1)]], sampler waterMaskTextureSmplr [[sampler(2)]], sampler noiseTextureSmplr [[sampler(3)]], sampler imageTextureSmplr [[sampler(4)]], sampler gradientTextureSmplr [[sampler(5)]], sampler normalTextureSmplr [[sampler(6)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float time = _58.uTime * 9.9999997473787516355514526367188e-06;
    float imageTexScale = 5.0;
    float4 waterColour = in.vColor;
    float4 foamColor = _58.uFoamColor * 10.0;
    float4 specularLightness = _58.uSpecularLightness * 10.0;
    float depth = _58.animationScale;
    float intensity = 0.89999997615814208984375;
    depth *= 0.89999997615814208984375;
    float2 uv = in.vUV;
    float2 noise_uv = uv * _58.reflectionThreshold;
    float speedbase = 10.0 * _58.animationSpeed;
    float Udir = speedbase / foamColor.x;
    float Vdir = speedbase / foamColor.y;
    float Udir2 = speedbase / specularLightness.x;
    float Vdir2 = speedbase / specularLightness.y;
    float3 mask = waterMaskTexture.read(uint2(int2(gl_FragCoord.xy)), 0).xyz;
    float2 param = uv;
    float2 param_1 = uv;
    float4 staticTileImage = fetchImageTexture2(imageTexture, imageTextureSmplr, param, param_1, _58);
    float2 param_2 = uv;
    float param_3 = Udir;
    float param_4 = Vdir;
    float2 panUVs = PanningUvs(param_2, param_3, param_4, time);
    float2 param_5 = uv;
    float param_6 = (-1.0) * Vdir;
    float param_7 = (-1.0) * Udir;
    float2 panUVs1 = PanningUvs(param_5, param_6, param_7, time);
    float4 noiseImage0 = noiseTexture.sample(noiseTextureSmplr, (panUVs * _58.reflectionThreshold));
    float4 noiseImage1 = noiseTexture.sample(noiseTextureSmplr, ((-panUVs) * _58.reflectionThreshold));
    float2 uv_1 = float2((uv.x + (noiseImage0.x * 0.02099999971687793731689453125)) * (1.0 - (mask.y * 0.00025000001187436282634735107421875)), (uv.y - (noiseImage1.x * 0.02099999971687793731689453125)) * (1.0 - (mask.y * 0.00025000001187436282634735107421875)));
    float2 param_8 = uv_1;
    float2 param_9 = uv_1;
    float4 tileImage = fetchImageTexture2(imageTexture, imageTextureSmplr, param_8, param_9, _58);
    float3 tileTexture = tileImage.xyz / float3(tileImage.w * 1.7999999523162841796875);
    float3 param_10 = tileTexture;
    float3 param_11 = waterColour.xyz;
    float param_12 = 0.5;
    tileTexture = overlay(param_10, param_11, param_12);
    float tileHeight = tileImage.w - mask.y;
    float2 param_13 = (uv_1 + float2(tileHeight / 30.0)) * _58.darkThreshold;
    float param_14 = Udir2;
    float param_15 = Vdir2;
    float2 panUVs3 = PanningUvs(param_13, param_14, param_15, time);
    float2 param_16 = (uv_1 + float2(tileHeight / 30.0)) * _58.darkThreshold;
    float param_17 = ((-1.0) * Udir2) / 1.0099999904632568359375;
    float param_18 = ((-1.0) * Vdir2) / 1.0099999904632568359375;
    float2 panUVs4 = PanningUvs(param_16, param_17, param_18, time);
    float4 noiseImage2 = noiseTexture.sample(noiseTextureSmplr, panUVs3);
    float4 noiseImage3 = noiseTexture.sample(noiseTextureSmplr, panUVs4);
    float2 param_19 = (uv_1 + float2(tileHeight / 20.0)) * 0.60000002384185791015625;
    float param_20 = Udir2;
    float param_21 = Vdir2;
    float2 panUVs5 = PanningUvs(param_19, param_20, param_21, time);
    float2 param_22 = (uv_1 + float2(tileHeight / 20.0)) * 0.60000002384185791015625;
    float param_23 = ((-1.0) * Udir2) / 1.0099999904632568359375;
    float param_24 = ((-1.0) * Vdir2) / 1.0099999904632568359375;
    float2 panUVs6 = PanningUvs(param_22, param_23, param_24, time);
    float4 noiseImage4 = noiseTexture.sample(noiseTextureSmplr, panUVs5);
    float4 noiseImage5 = noiseTexture.sample(noiseTextureSmplr, panUVs6);
    float gaussianNoise = noiseImage0.x;
    float detailNoise = noiseImage4.y * noiseImage5.y;
    float maskNoise = noiseImage2.z * noiseImage3.y;
    mask *= (float3(detailNoise) + (mask * 0.100000001490116119384765625));
    float3 tileTexturedebug = tileTexture;
    float2 param_25 = uv_1;
    float2 param_26 = uv_1;
    float4 tileNormal = fetchImageTexture2(normalTexture, normalTextureSmplr, param_25, param_26, _58);
    float3 tileHighlight = fast::clamp(powr(tileNormal.xyz, float3(1.2000000476837158203125)), float3(0.0), float3(1.0));
    float tileHighlightMask = fast::clamp(powr(noiseImage0.x * 2.0, 4.0), 0.0, 1.0);
    tileTexture = mix(tileTexture + tileHighlight, tileTexture, float3(1.0 - (fast::clamp(tileHighlightMask, 0.0, 1.0) * 0.5)));
    float3 param_27 = float3(detailNoise);
    float3 param_28 = float3(powr(tileHeight + (mask.y * 10.0), 1.0));
    float param_29 = 0.0;
    detailNoise = overlay(param_27, param_28, param_29).x;
    float oilMask = (1.5 * mix(fast::clamp(1.0 - tileHeight, 0.0, 1.0) - fast::clamp(tileHeight, 0.0, 1.0), 1.0 - tileHeight, 0.89999997615814208984375)) + (mask.y * 10.0);
    oilMask = mix(oilMask * powr(maskNoise, 1.0), oilMask, 0.0);
    float3 gradientImage = powr(gradientTexture.sample(gradientTextureSmplr, (float2(detailNoise, 10.0) * 5.0)).xyz, float3(1.0));
    float3 param_30 = tileTexture;
    float3 param_31 = gradientImage;
    float param_32 = fast::clamp(oilMask * 2.0, 0.0, 1.0) / _58.animationScale;
    float4 finalColor = float4(mix(overlay(param_30, param_31, param_32), tileTexture, float3(0.0)), 1.0);
    out.fragColor = finalColor;
    float4 param_33 = in.maskUVs;
    float param_34 = _58.timeRaw;
    out.fragColor *= fetchMaskTexture(mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, param_33, param_34);
    out.lightColor = float4(0.0, 0.0, 0.0, out.fragColor.w * _58.lightmapAlpha);
    return out;
}

