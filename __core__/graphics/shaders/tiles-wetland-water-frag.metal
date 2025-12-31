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
float4 PanningTexture(thread const float2& uv, thread const float& speedX, thread const float& speedY, texture2d<float> textureInput, sampler textureInputSmplr, thread const float2& variations, thread float& time, texture2d<float> noiseTexture, sampler noiseTextureSmplr)
{
    float2 uvDist = uv;
    uvDist.x += sin((time * 100.0) / speedX);
    uvDist.y += sin((time * 100.0) / speedY);
    float2 param = uvDist;
    float2 param_1 = variations;
    float4 pannerOut = noiseTexture.sample(noiseTextureSmplr, getRandomVariationUV(param, param_1));
    return pannerOut;
}

static inline __attribute__((always_inline))
float4 fetchImageTexture(thread const float2& uvA, thread const float2& uvB, constant EffectUniforms& _56, texture2d<float> imageTexture, sampler imageTextureSmplr)
{
    float2 uv = mix(uvA, uvB, float2(0.800000011920928955078125)) * 1.75;
    float2 param = uv;
    float2 param_1 = float2(_56.imageVariations);
    return imageTexture.sample(imageTextureSmplr, getRandomVariationUV(param, param_1));
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

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _56 [[buffer(0)]], texture2d<float> mask1Texture [[texture(0)]], texture2d<float> mask2Texture [[texture(1)]], texture2d<float> waterMaskTexture [[texture(2)]], texture2d<float> noiseTexture [[texture(3)]], texture2d<float> imageTexture [[texture(4)]], sampler mask1TextureSmplr [[sampler(0)]], sampler mask2TextureSmplr [[sampler(1)]], sampler waterMaskTextureSmplr [[sampler(2)]], sampler noiseTextureSmplr [[sampler(3)]], sampler imageTextureSmplr [[sampler(4)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float time = _56.uTime * 9.9999997473787516355514526367188e-06;
    float imageTexScale = 5.0;
    float4 waterColour = in.vColor;
    float4 rawMask = waterMaskTexture.read(uint2(int2(gl_FragCoord.xy)), 0);
    float4 foamColor = _56.uFoamColor * 10.0;
    float4 specularLightness = _56.uSpecularLightness * 10.0;
    float depth = _56.animationScale;
    float intensity = 0.89999997615814208984375;
    depth *= 0.89999997615814208984375;
    float2 uv = in.vUV;
    float2 noise_uv = uv * _56.reflectionThreshold;
    float speedbase = 10.0 * _56.animationSpeed;
    float Udir = speedbase / foamColor.x;
    float Vdir = speedbase / foamColor.y;
    float2 param = noise_uv;
    float param_1 = Udir;
    float param_2 = Vdir;
    float2 param_3 = float2(_56.noiseVariations);
    float4 noise_1 = PanningTexture(param, param_1, param_2, noiseTexture, noiseTextureSmplr, param_3, time, noiseTexture, noiseTextureSmplr);
    float2 param_4 = gl_FragCoord.xy;
    float param_5 = Udir;
    float param_6 = Vdir;
    float2 param_7 = float2(_56.noiseVariations);
    float4 global_noise = PanningTexture(param_4, param_5, param_6, noiseTexture, noiseTextureSmplr, param_7, time, noiseTexture, noiseTextureSmplr);
    float Udir2 = speedbase / specularLightness.x;
    float Vdir2 = speedbase / specularLightness.y;
    float2 param_8 = noise_uv * 2.0;
    float param_9 = Udir2;
    float param_10 = Vdir2;
    float2 param_11 = float2(_56.noiseVariations);
    float4 noise_2 = PanningTexture(param_8, param_9, param_10, noiseTexture, noiseTextureSmplr, param_11, time, noiseTexture, noiseTextureSmplr);
    float2 param_12 = noise_uv * 2.0;
    float param_13 = Udir2 / 3.0;
    float param_14 = Vdir2 / 3.0;
    float2 param_15 = float2(_56.noiseVariations);
    float4 noise_4 = PanningTexture(param_12, param_13, param_14, noiseTexture, noiseTextureSmplr, param_15, time, noiseTexture, noiseTextureSmplr);
    float2 param_16 = gl_FragCoord.xy;
    float param_17 = Udir2;
    float param_18 = Vdir2;
    float2 param_19 = float2(_56.noiseVariations);
    float4 global_noise2 = PanningTexture(param_16, param_17, param_18, noiseTexture, noiseTextureSmplr, param_19, time, noiseTexture, noiseTextureSmplr);
    float2 param_20 = gl_FragCoord.xy;
    float param_21 = Vdir2;
    float param_22 = Udir2;
    float2 param_23 = float2(_56.noiseVariations);
    float4 global_noise3 = PanningTexture(param_20, param_21, param_22, noiseTexture, noiseTextureSmplr, param_23, time, noiseTexture, noiseTextureSmplr);
    float u = noise_1.x;
    float v = noise_2.x;
    float u2 = noise_1.y;
    float v2 = noise_2.y;
    float u3 = noise_4.x;
    float v3 = noise_4.y;
    float2 globaluv = mix(float2(global_noise.x, global_noise2.y), gl_FragCoord.xy, float2(0.100000001490116119384765625));
    float2 uv_1 = mix(float2(u, v), uv, float2(intensity));
    float2 uv_2 = mix(uv_1, uv, float2(0.60000002384185791015625));
    float2 uv_3 = mix(uv_1, uv, float2(1.0));
    float2 uv_5 = mix(uv_1, uv, float2(0.89999997615814208984375));
    float2 uv_4 = float2(v2, u2);
    float4 noise_3 = noiseTexture.sample(noiseTextureSmplr, ((uv_2 * 3.0) + uv_4));
    float4 noise_5 = noiseTexture.sample(noiseTextureSmplr, ((float2(u3, v3) * 12.0) + uv_4));
    noise_3 *= noise_5;
    float sinTime = sin(time * 500.0) / 800.0;
    float cosTime = 1.0;
    float2 newTime = mix(float2(Udir2, Vdir2), float2(Udir, Vdir), float2((1.0 + sinTime) / 2.0));
    float2 param_24 = uv;
    float2 param_25 = uv;
    float2 uv100 = mix(uv_1, uv_2, float2(fast::clamp(fetchImageTexture(param_24, param_25, _56, imageTexture, imageTextureSmplr).w, 0.0, 1.0)));
    float2 param_26 = uv_2 * 5.0;
    float param_27 = 1.0 - newTime.x;
    float param_28 = 1.0 - newTime.y;
    float2 param_29 = float2(_56.noiseVariations);
    float4 caustic_1 = PanningTexture(param_26, param_27, param_28, noiseTexture, noiseTextureSmplr, param_29, time, noiseTexture, noiseTextureSmplr);
    float2 param_30 = uv_2 * 10.0;
    float param_31 = (cosTime * 1.0) - Udir2;
    float param_32 = (cosTime * 1.0) - Vdir2;
    float2 param_33 = float2(_56.noiseVariations);
    float4 caustic_2 = PanningTexture(param_30, param_31, param_32, noiseTexture, noiseTextureSmplr, param_33, time, noiseTexture, noiseTextureSmplr);
    float2 param_34 = uv_5 * 10.0;
    float param_35 = 1.0 - newTime.x;
    float param_36 = 1.0 - newTime.y;
    float2 param_37 = float2(_56.noiseVariations);
    float4 wave_1 = PanningTexture(param_34, param_35, param_36, noiseTexture, noiseTextureSmplr, param_37, time, noiseTexture, noiseTextureSmplr);
    float2 param_38 = uv_3 * 15.0;
    float param_39 = newTime.x;
    float param_40 = newTime.y;
    float2 param_41 = float2(_56.noiseVariations);
    float4 wave_2 = PanningTexture(param_38, param_39, param_40, noiseTexture, noiseTextureSmplr, param_41, time, noiseTexture, noiseTextureSmplr);
    float2 param_42 = uv_3 * 10.0;
    float param_43 = (1.0 - newTime.x) * 10.0;
    float param_44 = (1.0 - newTime.y) * 10.0;
    float2 param_45 = float2(_56.noiseVariations);
    float2 param_46 = uv_1 * 15.0;
    float param_47 = newTime.x;
    float param_48 = newTime.y;
    float2 param_49 = float2(_56.noiseVariations);
    float specular = PanningTexture(param_42, param_43, param_44, noiseTexture, noiseTextureSmplr, param_45, time, noiseTexture, noiseTextureSmplr).w * PanningTexture(param_46, param_47, param_48, noiseTexture, noiseTextureSmplr, param_49, time, noiseTexture, noiseTextureSmplr).y;
    float2 param_50 = (uv_3 * 5.0) - float2(0.5);
    float param_51 = 1.0 - newTime.y;
    float param_52 = 1.0 - newTime.x;
    float2 param_53 = float2(_56.noiseVariations);
    float2 param_54 = (uv_2 * 25.0) - float2(0.5);
    float param_55 = newTime.x;
    float param_56 = newTime.y;
    float2 param_57 = float2(_56.noiseVariations);
    float darks = (PanningTexture(param_50, param_51, param_52, noiseTexture, noiseTextureSmplr, param_53, time, noiseTexture, noiseTextureSmplr).w + 0.20000000298023223876953125) * PanningTexture(param_54, param_55, param_56, noiseTexture, noiseTextureSmplr, param_57, time, noiseTexture, noiseTextureSmplr).y;
    float2 param_58 = uv;
    float2 param_59 = uv;
    caustic_1 = mix(caustic_1, caustic_2, float4(fast::clamp(fetchImageTexture(param_58, param_59, _56, imageTexture, imageTextureSmplr).w - 0.100000001490116119384765625, 0.0, 1.0)));
    float2 param_60 = in.vUV;
    float param_61 = 2.0;
    float4 tex_1 = imageTexture.sample(imageTextureSmplr, SplatterUvs(param_60, param_61));
    float2 param_62 = in.vUV;
    float param_63 = 3.0;
    float4 tex_2 = imageTexture.sample(imageTextureSmplr, SplatterUvs(param_62, param_63));
    float2 param_64 = uv_2 * 10.0;
    float param_65 = 1.0 - newTime.x;
    float param_66 = 1.0 - newTime.y;
    float2 param_67 = float2(_56.noiseVariations);
    float2 param_68 = uv_5 * 10.0;
    float param_69 = newTime.y / 1.5;
    float param_70 = newTime.x / 1.5;
    float2 param_71 = float2(_56.noiseVariations);
    float4 deepWater = fast::max(float4(float3(PanningTexture(param_64, param_65, param_66, noiseTexture, noiseTextureSmplr, param_67, time, noiseTexture, noiseTextureSmplr).w) / float3(8.0), 0.0), float4(float3(PanningTexture(param_68, param_69, param_70, noiseTexture, noiseTextureSmplr, param_71, time, noiseTexture, noiseTextureSmplr).w) / float3(10.0), 0.0));
    waterColour -= mix(float4(float3(noiseTexture.sample(noiseTextureSmplr, (uv_2 * 10.0)).w / 8.0), 0.0), deepWater, float4(fast::clamp(depth - 0.5, 0.0, 1.0)));
    waterColour = mix(waterColour, float4(float3(waterColour.x * (noiseTexture.sample(noiseTextureSmplr, (in.vUV * 0.100000001490116119384765625)).w * 2.0), waterColour.y * (noiseTexture.sample(noiseTextureSmplr, ((in.vUV * 0.100000001490116119384765625) + float2(0.5))).w * 2.0), waterColour.z * (noiseTexture.sample(noiseTextureSmplr, ((in.vUV * (-0.100000001490116119384765625)) + float2(0.5))).w * 2.0)), 1.0), float4(0.100000001490116119384765625));
    float2 param_72 = uv_3;
    float2 param_73 = uv + float2(0.300000011920928955078125);
    float2 param_74 = uv_3;
    float2 param_75 = uv + float2(0.300000011920928955078125);
    float4 staticuv = mix(float4(fetchImageTexture(param_72, param_73, _56, imageTexture, imageTextureSmplr).xyz, 1.0), waterColour, float4(1.0 - fast::clamp(fetchImageTexture(param_74, param_75, _56, imageTexture, imageTextureSmplr).w / depth, 0.0, 1.0)));
    float2 param_76 = uv_1;
    float2 param_77 = uv + float2(0.300000011920928955078125);
    float2 param_78 = uv_1;
    float2 param_79 = uv + float2(0.300000011920928955078125);
    float4 finalimage = mix(float4(fetchImageTexture(param_76, param_77, _56, imageTexture, imageTextureSmplr).xyz, 1.0), waterColour, float4(1.0 - fast::clamp((fetchImageTexture(param_78, param_79, _56, imageTexture, imageTextureSmplr).w - _56.darkThreshold) / (depth * 1.5), 0.0, 1.0)));
    float4 caustics = float4((float3(0.9412000179290771484375, 1.0, 0.419600009918212890625) * float3(caustic_1.z)) * fast::clamp(1.0 - (depth * 0.5), 0.0, 1.0), 1.0);
    float4 waves_breakup = fast::max(float4(0.0, 0.0, 0.0, 1.0), float4(0.976499974727630615234375, 1.0, 0.627499997615814208984375, 0.08200000226497650146484375) * float4(float3(wave_1.y) * 0.189999997615814208984375, 1.0));
    float4 waves = fast::max(float4(0.0, 0.0, 0.0, 1.0), float4(0.976499974727630615234375, 1.0, 0.627499997615814208984375, 0.08200000226497650146484375) * float4(float3(wave_1.y) * fast::clamp(1.0 - (depth * 0.949999988079071044921875), 0.0, 1.0), 1.0));
    float4 spec = float4((float3(0.5724999904632568359375, 0.91369998455047607421875, 1.0) * waterColour.xyz) * float3(powr(smoothstep(0.0, 0.800000011920928955078125, (specular + 0.20000000298023223876953125) - noise_5.x), 2.0)), 0.0);
    spec = fast::max(spec, spec + float4(float3(1.0) * float3(powr(smoothstep(0.0, 0.800000011920928955078125, (specular + _56.specularThreshold) - noise_5.x) * 3.0, 5.0)), 0.0));
    spec = fast::max(spec - float4(0.02999999932944774627685546875, 0.02999999932944774627685546875, 0.02999999932944774627685546875, 0.0), float4(0.0));
    spec = fast::clamp(spec, float4(0.0), float4(1.0));
    float4 dark = float4(float3(0.278400003910064697265625) * float3(powr(smoothstep(0.0, 0.89999997615814208984375, (darks + 0.25) - noise_5.x), 2.0)), 0.0);
    float4 mask = rawMask - float4(specular * 6.0);
    float waterShadow = smoothstep(0.85000002384185791015625 * rawMask.x, 0.89999997615814208984375, rawMask.x - (waves_breakup.x * 2.0));
    float reflectionMask = smoothstep(0.449999988079071044921875 * rawMask.x, 0.699999988079071044921875, rawMask.x - (waves_breakup.x * 4.0));
    float4 foamMask = float4(smoothstep(float3(0.64999997615814208984375), float3(2.0 - mask.z), float3(mask.z)), 0.0);
    foamMask += fast::clamp((float4(smoothstep(float3(0.5 * mask.z), float3(0.550000011920928955078125 - mask.z), float3(mask.z)) * (1.0 - (waves_breakup.x * 30.0)), 0.0) * 2.0) * mask.z, float4(0.0), float4(1.0));
    out.fragColor = mix(float4(finalimage.xyz, 1.0) + waves, (float4(finalimage.xyz, 1.0) + caustics) + waves, float4(fast::clamp(_56.daytimeAlpha, 0.300000011920928955078125, 1.0)));
    caustics = float4(powr(float3(1.0) - caustics.xyz, float3(3.0)), 1.0);
    waves = float4(powr(float3(1.0) - waves.xyz, float3(1.0)), 1.0);
    out.fragColor = mix(float4(finalimage.xyz, 1.0) / waves, (float4(finalimage.xyz, 1.0) / caustics) / waves, float4(fast::clamp(_56.daytimeAlpha - waterShadow, 0.300000011920928955078125, 1.0)));
    spec = float4(mix(spec.xyz, spec.xyz * waterColour.xyz, float3(0.64999997615814208984375)), spec.w);
    out.fragColor = float4(mix(out.fragColor.xyz, out.fragColor.xyz + spec.xyz, float3(0.75 + (0.25 * _56.daytimeAlpha))), 1.0);
    if (_56.isPuddle != 0u)
    {
        float2 param_80 = uv_1;
        float2 param_81 = uv + float2(0.300000011920928955078125);
        out.fragColor *= (float4(1.0) - float4((((((waterColour.xyz * 0.800000011920928955078125) * smoothstep(0.5, 0.699999988079071044921875, reflectionMask)) * 1.5) * ((1.0 - fetchImageTexture(param_80, param_81, _56, imageTexture, imageTextureSmplr).w) * 2.0)) * 0.5) * _56.daytimeAlpha, 0.0));
    }
    if (!(_56.isPuddle != 0u))
    {
        out.fragColor += fast::clamp(foamMask, float4(0.0), float4(0.300000011920928955078125));
    }
    float4 param_82 = in.maskUVs;
    float param_83 = _56.timeRaw;
    out.fragColor *= ((1.0 - rawMask.y) * fetchMaskTexture(mask1Texture, mask1TextureSmplr, mask2Texture, mask2TextureSmplr, param_82, param_83));
    out.lightColor = float4(0.0, 0.0, 0.0, out.fragColor.w * _56.lightmapAlpha);
    return out;
}

