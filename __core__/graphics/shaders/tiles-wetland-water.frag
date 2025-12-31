#version 330

layout(std140) uniform EffectUniforms
{
    vec2 resolution;
    vec2 backgroundOffset;
    float padding_0;
    float timeRaw;
    float uTime;
    float zoom;
    vec4 uSpecularLightness;
    vec4 uFoamColor;
    float animationSpeed;
    float animationScale;
    float darkThreshold;
    float reflectionThreshold;
    float specularThreshold;
    float daytimeAlpha;
    uint isPuddle;
    float lightmapAlpha;
    ivec2 noiseVariations;
    ivec2 imageVariations;
} _56;

uniform sampler2D noiseTexture;
uniform sampler2D imageTexture;
uniform sampler2D waterMaskTexture;
uniform sampler2D mask1Texture;
uniform sampler2D mask2Texture;

in vec4 vColor;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
in vec4 maskUVs;
layout(location = 1) out vec4 lightColor;
float time;
float imageTexScale;
vec4 waterColour;

vec2 random2(vec2 st)
{
    vec2 s = vec2(dot(st, vec2(12.345600128173828125, 34.141498565673828125)), dot(st, vec2(42.21540069580078125, 15.285400390625)));
    return fract(sin(s) * 45678.8984375);
}

vec2 getRandomVariationUV(vec2 uv, vec2 variations)
{
    vec2 fUV = fract(uv);
    vec2 iUV = floor(uv);
    vec2 param = iUV;
    vec2 r = floor(random2(param) * variations);
    vec2 size = vec2(1.0) / variations;
    vec2 finalUV = (fUV * size) + (r * size);
    return finalUV;
}

vec4 PanningTexture(vec2 uv, float speedX, float speedY, sampler2D textureInput, vec2 variations)
{
    vec2 uvDist = uv;
    uvDist.x += sin((time * 100.0) / speedX);
    uvDist.y += sin((time * 100.0) / speedY);
    vec2 param = uvDist;
    vec2 param_1 = variations;
    vec4 pannerOut = texture(noiseTexture, getRandomVariationUV(param, param_1));
    return pannerOut;
}

vec4 fetchImageTexture(vec2 uvA, vec2 uvB)
{
    vec2 uv = mix(uvA, uvB, vec2(0.800000011920928955078125)) * 1.75;
    vec2 param = uv;
    vec2 param_1 = vec2(_56.imageVariations);
    return texture(imageTexture, getRandomVariationUV(param, param_1));
}

vec2 SplatterUvs(vec2 uv, float scale)
{
    vec2 scalar = uv * scale;
    vec2 index = floor(scalar) - scalar;
    float offset1 = index.x;
    float offset2 = index.y + 3.0;
    vec2 splatter = vec2(offset1, offset2);
    return splatter;
}

float fetchMaskTexture(sampler2D mask1Texture_1, sampler2D mask2Texture_1, vec4 maskUVs_1, float time_1)
{
    float mask = 1.0;
    vec2 mask1UV = maskUVs_1.xy;
    vec2 mask2UV = maskUVs_1.zw;
    if (mask1UV.x > (-1.0))
    {
        mask = texture(mask1Texture_1, mask1UV).x;
        if (mask2UV.x > (-1.0))
        {
            mask *= texture(mask2Texture_1, mask2UV).x;
        }
        else
        {
            if (mask2UV.x <= (-2.0))
            {
                float timeScale = (-mask2UV.x) - 2.0;
                float wave = (sin((time_1 * timeScale) + mask2UV.y) + 1.0) * 0.357142865657806396484375;
                mask = 1.0 - smoothstep(wave, wave + 0.300000011920928955078125, 1.0 - mask);
            }
        }
    }
    return mask;
}

void main()
{
    time = _56.uTime * 9.9999997473787516355514526367188e-06;
    imageTexScale = 5.0;
    waterColour = vColor;
    vec4 rawMask = texelFetch(waterMaskTexture, ivec2(gl_FragCoord.xy), 0);
    vec4 foamColor = _56.uFoamColor * 10.0;
    vec4 specularLightness = _56.uSpecularLightness * 10.0;
    float depth = _56.animationScale;
    float intensity = 0.89999997615814208984375;
    depth *= 0.89999997615814208984375;
    vec2 uv = vUV;
    vec2 noise_uv = uv * _56.reflectionThreshold;
    float speedbase = 10.0 * _56.animationSpeed;
    float Udir = speedbase / foamColor.x;
    float Vdir = speedbase / foamColor.y;
    vec2 param = noise_uv;
    float param_1 = Udir;
    float param_2 = Vdir;
    vec2 param_3 = vec2(_56.noiseVariations);
    vec4 noise_1 = PanningTexture(param, param_1, param_2, noiseTexture, param_3);
    vec2 param_4 = gl_FragCoord.xy;
    float param_5 = Udir;
    float param_6 = Vdir;
    vec2 param_7 = vec2(_56.noiseVariations);
    vec4 global_noise = PanningTexture(param_4, param_5, param_6, noiseTexture, param_7);
    float Udir2 = speedbase / specularLightness.x;
    float Vdir2 = speedbase / specularLightness.y;
    vec2 param_8 = noise_uv * 2.0;
    float param_9 = Udir2;
    float param_10 = Vdir2;
    vec2 param_11 = vec2(_56.noiseVariations);
    vec4 noise_2 = PanningTexture(param_8, param_9, param_10, noiseTexture, param_11);
    vec2 param_12 = noise_uv * 2.0;
    float param_13 = Udir2 / 3.0;
    float param_14 = Vdir2 / 3.0;
    vec2 param_15 = vec2(_56.noiseVariations);
    vec4 noise_4 = PanningTexture(param_12, param_13, param_14, noiseTexture, param_15);
    vec2 param_16 = gl_FragCoord.xy;
    float param_17 = Udir2;
    float param_18 = Vdir2;
    vec2 param_19 = vec2(_56.noiseVariations);
    vec4 global_noise2 = PanningTexture(param_16, param_17, param_18, noiseTexture, param_19);
    vec2 param_20 = gl_FragCoord.xy;
    float param_21 = Vdir2;
    float param_22 = Udir2;
    vec2 param_23 = vec2(_56.noiseVariations);
    vec4 global_noise3 = PanningTexture(param_20, param_21, param_22, noiseTexture, param_23);
    float u = noise_1.x;
    float v = noise_2.x;
    float u2 = noise_1.y;
    float v2 = noise_2.y;
    float u3 = noise_4.x;
    float v3 = noise_4.y;
    vec2 globaluv = mix(vec2(global_noise.x, global_noise2.y), gl_FragCoord.xy, vec2(0.100000001490116119384765625));
    vec2 uv_1 = mix(vec2(u, v), uv, vec2(intensity));
    vec2 uv_2 = mix(uv_1, uv, vec2(0.60000002384185791015625));
    vec2 uv_3 = mix(uv_1, uv, vec2(1.0));
    vec2 uv_5 = mix(uv_1, uv, vec2(0.89999997615814208984375));
    vec2 uv_4 = vec2(v2, u2);
    vec4 noise_3 = texture(noiseTexture, (uv_2 * 3.0) + uv_4);
    vec4 noise_5 = texture(noiseTexture, (vec2(u3, v3) * 12.0) + uv_4);
    noise_3 *= noise_5;
    float sinTime = sin(time * 500.0) / 800.0;
    float cosTime = 1.0;
    vec2 newTime = mix(vec2(Udir2, Vdir2), vec2(Udir, Vdir), vec2((1.0 + sinTime) / 2.0));
    vec2 param_24 = uv;
    vec2 param_25 = uv;
    vec2 uv100 = mix(uv_1, uv_2, vec2(clamp(fetchImageTexture(param_24, param_25).w, 0.0, 1.0)));
    vec2 param_26 = uv_2 * 5.0;
    float param_27 = 1.0 - newTime.x;
    float param_28 = 1.0 - newTime.y;
    vec2 param_29 = vec2(_56.noiseVariations);
    vec4 caustic_1 = PanningTexture(param_26, param_27, param_28, noiseTexture, param_29);
    vec2 param_30 = uv_2 * 10.0;
    float param_31 = (cosTime * 1.0) - Udir2;
    float param_32 = (cosTime * 1.0) - Vdir2;
    vec2 param_33 = vec2(_56.noiseVariations);
    vec4 caustic_2 = PanningTexture(param_30, param_31, param_32, noiseTexture, param_33);
    vec2 param_34 = uv_5 * 10.0;
    float param_35 = 1.0 - newTime.x;
    float param_36 = 1.0 - newTime.y;
    vec2 param_37 = vec2(_56.noiseVariations);
    vec4 wave_1 = PanningTexture(param_34, param_35, param_36, noiseTexture, param_37);
    vec2 param_38 = uv_3 * 15.0;
    float param_39 = newTime.x;
    float param_40 = newTime.y;
    vec2 param_41 = vec2(_56.noiseVariations);
    vec4 wave_2 = PanningTexture(param_38, param_39, param_40, noiseTexture, param_41);
    vec2 param_42 = uv_3 * 10.0;
    float param_43 = (1.0 - newTime.x) * 10.0;
    float param_44 = (1.0 - newTime.y) * 10.0;
    vec2 param_45 = vec2(_56.noiseVariations);
    vec2 param_46 = uv_1 * 15.0;
    float param_47 = newTime.x;
    float param_48 = newTime.y;
    vec2 param_49 = vec2(_56.noiseVariations);
    float specular = PanningTexture(param_42, param_43, param_44, noiseTexture, param_45).w * PanningTexture(param_46, param_47, param_48, noiseTexture, param_49).y;
    vec2 param_50 = (uv_3 * 5.0) - vec2(0.5);
    float param_51 = 1.0 - newTime.y;
    float param_52 = 1.0 - newTime.x;
    vec2 param_53 = vec2(_56.noiseVariations);
    vec2 param_54 = (uv_2 * 25.0) - vec2(0.5);
    float param_55 = newTime.x;
    float param_56 = newTime.y;
    vec2 param_57 = vec2(_56.noiseVariations);
    float darks = (PanningTexture(param_50, param_51, param_52, noiseTexture, param_53).w + 0.20000000298023223876953125) * PanningTexture(param_54, param_55, param_56, noiseTexture, param_57).y;
    vec2 param_58 = uv;
    vec2 param_59 = uv;
    caustic_1 = mix(caustic_1, caustic_2, vec4(clamp(fetchImageTexture(param_58, param_59).w - 0.100000001490116119384765625, 0.0, 1.0)));
    vec2 param_60 = vUV;
    float param_61 = 2.0;
    vec4 tex_1 = texture(imageTexture, SplatterUvs(param_60, param_61));
    vec2 param_62 = vUV;
    float param_63 = 3.0;
    vec4 tex_2 = texture(imageTexture, SplatterUvs(param_62, param_63));
    vec2 param_64 = uv_2 * 10.0;
    float param_65 = 1.0 - newTime.x;
    float param_66 = 1.0 - newTime.y;
    vec2 param_67 = vec2(_56.noiseVariations);
    vec2 param_68 = uv_5 * 10.0;
    float param_69 = newTime.y / 1.5;
    float param_70 = newTime.x / 1.5;
    vec2 param_71 = vec2(_56.noiseVariations);
    vec4 deepWater = max(vec4(vec3(PanningTexture(param_64, param_65, param_66, noiseTexture, param_67).w) / vec3(8.0), 0.0), vec4(vec3(PanningTexture(param_68, param_69, param_70, noiseTexture, param_71).w) / vec3(10.0), 0.0));
    waterColour -= mix(vec4(vec3(texture(noiseTexture, uv_2 * 10.0).w / 8.0), 0.0), deepWater, vec4(clamp(depth - 0.5, 0.0, 1.0)));
    waterColour = mix(waterColour, vec4(vec3(waterColour.x * (texture(noiseTexture, vUV * 0.100000001490116119384765625).w * 2.0), waterColour.y * (texture(noiseTexture, (vUV * 0.100000001490116119384765625) + vec2(0.5)).w * 2.0), waterColour.z * (texture(noiseTexture, (vUV * (-0.100000001490116119384765625)) + vec2(0.5)).w * 2.0)), 1.0), vec4(0.100000001490116119384765625));
    vec2 param_72 = uv_3;
    vec2 param_73 = uv + vec2(0.300000011920928955078125);
    vec2 param_74 = uv_3;
    vec2 param_75 = uv + vec2(0.300000011920928955078125);
    vec4 staticuv = mix(vec4(fetchImageTexture(param_72, param_73).xyz, 1.0), waterColour, vec4(1.0 - clamp(fetchImageTexture(param_74, param_75).w / depth, 0.0, 1.0)));
    vec2 param_76 = uv_1;
    vec2 param_77 = uv + vec2(0.300000011920928955078125);
    vec2 param_78 = uv_1;
    vec2 param_79 = uv + vec2(0.300000011920928955078125);
    vec4 finalimage = mix(vec4(fetchImageTexture(param_76, param_77).xyz, 1.0), waterColour, vec4(1.0 - clamp((fetchImageTexture(param_78, param_79).w - _56.darkThreshold) / (depth * 1.5), 0.0, 1.0)));
    vec4 caustics = vec4((vec3(0.9412000179290771484375, 1.0, 0.419600009918212890625) * vec3(caustic_1.z)) * clamp(1.0 - (depth * 0.5), 0.0, 1.0), 1.0);
    vec4 waves_breakup = max(vec4(0.0, 0.0, 0.0, 1.0), vec4(0.976499974727630615234375, 1.0, 0.627499997615814208984375, 0.08200000226497650146484375) * vec4(vec3(wave_1.y) * 0.189999997615814208984375, 1.0));
    vec4 waves = max(vec4(0.0, 0.0, 0.0, 1.0), vec4(0.976499974727630615234375, 1.0, 0.627499997615814208984375, 0.08200000226497650146484375) * vec4(vec3(wave_1.y) * clamp(1.0 - (depth * 0.949999988079071044921875), 0.0, 1.0), 1.0));
    vec4 spec = vec4((vec3(0.5724999904632568359375, 0.91369998455047607421875, 1.0) * waterColour.xyz) * vec3(pow(smoothstep(0.0, 0.800000011920928955078125, (specular + 0.20000000298023223876953125) - noise_5.x), 2.0)), 0.0);
    spec = max(spec, spec + vec4(vec3(1.0) * vec3(pow(smoothstep(0.0, 0.800000011920928955078125, (specular + _56.specularThreshold) - noise_5.x) * 3.0, 5.0)), 0.0));
    spec = max(spec - vec4(0.02999999932944774627685546875, 0.02999999932944774627685546875, 0.02999999932944774627685546875, 0.0), vec4(0.0));
    spec = clamp(spec, vec4(0.0), vec4(1.0));
    vec4 dark = vec4(vec3(0.278400003910064697265625) * vec3(pow(smoothstep(0.0, 0.89999997615814208984375, (darks + 0.25) - noise_5.x), 2.0)), 0.0);
    vec4 mask = rawMask - vec4(specular * 6.0);
    float waterShadow = smoothstep(0.85000002384185791015625 * rawMask.x, 0.89999997615814208984375, rawMask.x - (waves_breakup.x * 2.0));
    float reflectionMask = smoothstep(0.449999988079071044921875 * rawMask.x, 0.699999988079071044921875, rawMask.x - (waves_breakup.x * 4.0));
    vec4 foamMask = vec4(smoothstep(vec3(0.64999997615814208984375), vec3(2.0 - mask.z), vec3(mask.z)), 0.0);
    foamMask += clamp((vec4(smoothstep(vec3(0.5 * mask.z), vec3(0.550000011920928955078125 - mask.z), vec3(mask.z)) * (1.0 - (waves_breakup.x * 30.0)), 0.0) * 2.0) * mask.z, vec4(0.0), vec4(1.0));
    fragColor = mix(vec4(finalimage.xyz, 1.0) + waves, (vec4(finalimage.xyz, 1.0) + caustics) + waves, vec4(clamp(_56.daytimeAlpha, 0.300000011920928955078125, 1.0)));
    caustics = vec4(pow(vec3(1.0) - caustics.xyz, vec3(3.0)), 1.0);
    waves = vec4(pow(vec3(1.0) - waves.xyz, vec3(1.0)), 1.0);
    fragColor = mix(vec4(finalimage.xyz, 1.0) / waves, (vec4(finalimage.xyz, 1.0) / caustics) / waves, vec4(clamp(_56.daytimeAlpha - waterShadow, 0.300000011920928955078125, 1.0)));
    spec = vec4(mix(spec.xyz, spec.xyz * waterColour.xyz, vec3(0.64999997615814208984375)), spec.w);
    fragColor = vec4(mix(fragColor.xyz, fragColor.xyz + spec.xyz, vec3(0.75 + (0.25 * _56.daytimeAlpha))), 1.0);
    if (_56.isPuddle != 0u)
    {
        vec2 param_80 = uv_1;
        vec2 param_81 = uv + vec2(0.300000011920928955078125);
        fragColor *= (vec4(1.0) - vec4((((((waterColour.xyz * 0.800000011920928955078125) * smoothstep(0.5, 0.699999988079071044921875, reflectionMask)) * 1.5) * ((1.0 - fetchImageTexture(param_80, param_81).w) * 2.0)) * 0.5) * _56.daytimeAlpha, 0.0));
    }
    if (!(_56.isPuddle != 0u))
    {
        fragColor += clamp(foamMask, vec4(0.0), vec4(0.300000011920928955078125));
    }
    vec4 param_82 = maskUVs;
    float param_83 = _56.timeRaw;
    fragColor *= ((1.0 - rawMask.y) * fetchMaskTexture(mask1Texture, mask2Texture, param_82, param_83));
    lightColor = vec4(0.0, 0.0, 0.0, fragColor.w * _56.lightmapAlpha);
}

