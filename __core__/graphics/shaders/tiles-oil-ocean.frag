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
} _58;

uniform sampler2D waterMaskTexture;
uniform sampler2D imageTexture;
uniform sampler2D noiseTexture;
uniform sampler2D normalTexture;
uniform sampler2D gradientTexture;
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

vec4 fetchImageTexture2(sampler2D tex, vec2 uvA, vec2 uvB)
{
    vec2 uv = mix(uvA, uvB, vec2(0.800000011920928955078125)) * 1.75;
    vec2 param = uv;
    vec2 param_1 = vec2(_58.imageVariations);
    return texture(tex, getRandomVariationUV(param, param_1));
}

vec2 PanningUvs(vec2 uv, float speedX, float speedY)
{
    vec2 uvDist = uv;
    uvDist.x += sin((time * 1000.0) / speedX);
    uvDist.y += sin((time * 1000.0) / speedY);
    uvDist = vec2(uvDist.x, uvDist.y);
    return uvDist;
}

vec3 overlay(vec3 image_1, vec3 image_2, float opacity)
{
    vec3 multiply = (image_1 * 2.0) * image_2;
    vec3 screen = vec3(1.0) - (((vec3(1.0) - image_1) * 2.0) * (vec3(1.0) - image_2));
    float threshold = step(dot(image_1, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)), 0.5);
    vec3 result = mix(screen, multiply, vec3(threshold));
    return mix(image_1, result, vec3(opacity));
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
    time = _58.uTime * 9.9999997473787516355514526367188e-06;
    imageTexScale = 5.0;
    waterColour = vColor;
    vec4 foamColor = _58.uFoamColor * 10.0;
    vec4 specularLightness = _58.uSpecularLightness * 10.0;
    float depth = _58.animationScale;
    float intensity = 0.89999997615814208984375;
    depth *= 0.89999997615814208984375;
    vec2 uv = vUV;
    vec2 noise_uv = uv * _58.reflectionThreshold;
    float speedbase = 10.0 * _58.animationSpeed;
    float Udir = speedbase / foamColor.x;
    float Vdir = speedbase / foamColor.y;
    float Udir2 = speedbase / specularLightness.x;
    float Vdir2 = speedbase / specularLightness.y;
    vec3 mask = texelFetch(waterMaskTexture, ivec2(gl_FragCoord.xy), 0).xyz;
    vec2 param = uv;
    vec2 param_1 = uv;
    vec4 staticTileImage = fetchImageTexture2(imageTexture, param, param_1);
    vec2 param_2 = uv;
    float param_3 = Udir;
    float param_4 = Vdir;
    vec2 panUVs = PanningUvs(param_2, param_3, param_4);
    vec2 param_5 = uv;
    float param_6 = (-1.0) * Vdir;
    float param_7 = (-1.0) * Udir;
    vec2 panUVs1 = PanningUvs(param_5, param_6, param_7);
    vec4 noiseImage0 = texture(noiseTexture, panUVs * _58.reflectionThreshold);
    vec4 noiseImage1 = texture(noiseTexture, (-panUVs) * _58.reflectionThreshold);
    vec2 uv_1 = vec2((uv.x + (noiseImage0.x * 0.02099999971687793731689453125)) * (1.0 - (mask.y * 0.00025000001187436282634735107421875)), (uv.y - (noiseImage1.x * 0.02099999971687793731689453125)) * (1.0 - (mask.y * 0.00025000001187436282634735107421875)));
    vec2 param_8 = uv_1;
    vec2 param_9 = uv_1;
    vec4 tileImage = fetchImageTexture2(imageTexture, param_8, param_9);
    vec3 tileTexture = tileImage.xyz / vec3(tileImage.w * 1.7999999523162841796875);
    vec3 param_10 = tileTexture;
    vec3 param_11 = waterColour.xyz;
    float param_12 = 0.5;
    tileTexture = overlay(param_10, param_11, param_12);
    float tileHeight = tileImage.w - mask.y;
    vec2 param_13 = (uv_1 + vec2(tileHeight / 30.0)) * _58.darkThreshold;
    float param_14 = Udir2;
    float param_15 = Vdir2;
    vec2 panUVs3 = PanningUvs(param_13, param_14, param_15);
    vec2 param_16 = (uv_1 + vec2(tileHeight / 30.0)) * _58.darkThreshold;
    float param_17 = ((-1.0) * Udir2) / 1.0099999904632568359375;
    float param_18 = ((-1.0) * Vdir2) / 1.0099999904632568359375;
    vec2 panUVs4 = PanningUvs(param_16, param_17, param_18);
    vec4 noiseImage2 = texture(noiseTexture, panUVs3);
    vec4 noiseImage3 = texture(noiseTexture, panUVs4);
    vec2 param_19 = (uv_1 + vec2(tileHeight / 20.0)) * 0.60000002384185791015625;
    float param_20 = Udir2;
    float param_21 = Vdir2;
    vec2 panUVs5 = PanningUvs(param_19, param_20, param_21);
    vec2 param_22 = (uv_1 + vec2(tileHeight / 20.0)) * 0.60000002384185791015625;
    float param_23 = ((-1.0) * Udir2) / 1.0099999904632568359375;
    float param_24 = ((-1.0) * Vdir2) / 1.0099999904632568359375;
    vec2 panUVs6 = PanningUvs(param_22, param_23, param_24);
    vec4 noiseImage4 = texture(noiseTexture, panUVs5);
    vec4 noiseImage5 = texture(noiseTexture, panUVs6);
    float gaussianNoise = noiseImage0.x;
    float detailNoise = noiseImage4.y * noiseImage5.y;
    float maskNoise = noiseImage2.z * noiseImage3.y;
    mask *= (vec3(detailNoise) + (mask * 0.100000001490116119384765625));
    vec3 tileTexturedebug = tileTexture;
    vec2 param_25 = uv_1;
    vec2 param_26 = uv_1;
    vec4 tileNormal = fetchImageTexture2(normalTexture, param_25, param_26);
    vec3 tileHighlight = clamp(pow(tileNormal.xyz, vec3(1.2000000476837158203125)), vec3(0.0), vec3(1.0));
    float tileHighlightMask = clamp(pow(noiseImage0.x * 2.0, 4.0), 0.0, 1.0);
    tileTexture = mix(tileTexture + tileHighlight, tileTexture, vec3(1.0 - (clamp(tileHighlightMask, 0.0, 1.0) * 0.5)));
    vec3 param_27 = vec3(detailNoise);
    vec3 param_28 = vec3(pow(tileHeight + (mask.y * 10.0), 1.0));
    float param_29 = 0.0;
    detailNoise = overlay(param_27, param_28, param_29).x;
    float oilMask = (1.5 * mix(clamp(1.0 - tileHeight, 0.0, 1.0) - clamp(tileHeight, 0.0, 1.0), 1.0 - tileHeight, 0.89999997615814208984375)) + (mask.y * 10.0);
    oilMask = mix(oilMask * pow(maskNoise, 1.0), oilMask, 0.0);
    vec3 gradientImage = pow(texture(gradientTexture, vec2(detailNoise, 10.0) * 5.0).xyz, vec3(1.0));
    vec3 param_30 = tileTexture;
    vec3 param_31 = gradientImage;
    float param_32 = clamp(oilMask * 2.0, 0.0, 1.0) / _58.animationScale;
    vec4 finalColor = vec4(mix(overlay(param_30, param_31, param_32), tileTexture, vec3(0.0)), 1.0);
    fragColor = finalColor;
    vec4 param_33 = maskUVs;
    float param_34 = _58.timeRaw;
    fragColor *= fetchMaskTexture(mask1Texture, mask2Texture, param_33, param_34);
    lightColor = vec4(0.0, 0.0, 0.0, fragColor.w * _58.lightmapAlpha);
}

