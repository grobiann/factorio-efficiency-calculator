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
} _54;

uniform sampler2D imageTexture;
uniform sampler2D waterMaskTexture;
uniform sampler2D noiseTexture;
uniform sampler2D mask1Texture;
uniform sampler2D mask2Texture;

in vec2 vUV;
in vec4 maskUVs;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;
in vec4 vColor;
float time;
float imageTexScale;

vec2 PanningUvs(vec2 uv, float speedX, float speedY)
{
    vec2 uvDist = uv;
    uvDist.x += sin((time * 200.0) / speedX);
    uvDist.y += sin((time * 200.0) / speedY);
    uvDist = vec2(uvDist.x, uvDist.y);
    return uvDist;
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

vec4 fetchImageTexture(vec2 uvA, vec2 uvB)
{
    vec2 uv = mix(uvA, uvB, vec2(_54.animationScale)) * 2.0;
    vec2 param = uv;
    vec2 param_1 = vec2(_54.imageVariations);
    return texture(imageTexture, getRandomVariationUV(param, param_1));
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
    time = _54.uTime * 9.9999997473787516355514526367188e-06;
    imageTexScale = 5.0;
    vec3 effectMask = texelFetch(waterMaskTexture, ivec2(gl_FragCoord.xy), 0).xyz;
    vec4 foamColor = _54.uFoamColor * 10.0;
    vec4 specularLightness = _54.uSpecularLightness * 10.0;
    float intensity = _54.animationScale;
    vec2 uv = vUV * 1.0;
    vec2 noise_uv = uv * _54.reflectionThreshold;
    float speedbase = 10.0 * _54.animationSpeed;
    float Udir2 = speedbase / specularLightness.x;
    float Vdir2 = speedbase / specularLightness.y;
    float Udir = speedbase / foamColor.x;
    float Vdir = speedbase / foamColor.y;
    vec2 param = noise_uv;
    float param_1 = Udir;
    float param_2 = Vdir;
    vec2 warpUV1 = PanningUvs(param, param_1, param_2);
    vec2 param_3 = noise_uv;
    float param_4 = Udir2;
    float param_5 = Vdir2;
    vec2 warpUV2 = PanningUvs(param_3, param_4, param_5);
    vec2 param_6 = noise_uv;
    float param_7 = Udir2 / 3.0;
    float param_8 = Vdir2 / 3.0;
    vec2 warpUV3 = PanningUvs(param_6, param_7, param_8);
    vec4 noise_1 = texture(noiseTexture, warpUV1);
    vec4 noise_2 = texture(noiseTexture, warpUV2);
    vec4 noise_4 = texture(noiseTexture, warpUV2);
    float u = noise_1.x;
    float v = noise_2.x;
    float u2 = noise_1.y;
    float v2 = noise_2.y;
    float u3 = noise_4.x;
    float v3 = noise_4.y;
    vec2 uv_1 = mix(vec2(u, v), uv, vec2(intensity));
    vec2 uv_2 = mix(vec2(v, u), uv, vec2(intensity));
    vec2 uv_3 = mix(vec2(v2, u), uv, vec2(intensity));
    vec2 uv_4 = vec2(v2, u2);
    vec4 noise_3 = texture(noiseTexture, (uv_2 * 3.0) + uv_4);
    vec3 debug = vec3(noise_3.z);
    vec4 noise_5 = texture(noiseTexture, (vec2(u3, v3) * 0.5) + uv_4);
    noise_3 *= noise_5;
    vec2 param_9 = vUV;
    float param_10 = 2.0;
    vec4 tex_1 = texture(imageTexture, SplatterUvs(param_9, param_10));
    vec2 param_11 = vUV;
    float param_12 = 3.0;
    vec4 tex_2 = texture(imageTexture, SplatterUvs(param_11, param_12));
    vec2 param_13 = uv_1;
    vec2 param_14 = uv + vec2(0.300000011920928955078125);
    vec2 param_15 = uv_2;
    vec2 param_16 = uv;
    vec4 finalimage = mix(fetchImageTexture(param_13, param_14), fetchImageTexture(param_15, param_16), vec4(clamp(noise_3.z, 0.0, 1.0)));
    vec4 colour = vec4(0.0);
    vec2 _477 = (finalimage.xy * (0.75 * _54.specularThreshold)) * vec2(2.0 * effectMask.z, effectMask.z);
    colour.x = _477.x;
    colour.y = _477.y;
    vec4 _493 = colour;
    vec2 _495 = _493.xy + (vec2(effectMask.z, 0.5 * effectMask.z) * (0.75 * _54.darkThreshold));
    colour.x = _495.x;
    colour.y = _495.y;
    colour += finalimage;
    colour *= (1.0 - effectMask.y);
    vec4 param_17 = maskUVs;
    float param_18 = _54.timeRaw;
    float maskValue = fetchMaskTexture(mask1Texture, mask2Texture, param_17, param_18);
    fragColor = colour * maskValue;
    float light = max(colour.x, max(colour.y, colour.z));
    light = clamp(light + ((colour.x + colour.y) + colour.z), 0.0, 1.0);
    lightColor = vec4(light, light * 0.699999988079071044921875, light * 0.5, _54.lightmapAlpha) * maskValue;
}

