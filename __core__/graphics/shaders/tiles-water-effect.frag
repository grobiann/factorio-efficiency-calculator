#version 330

layout(std140) uniform EffectUniforms
{
    vec2 resolution;
    vec2 backgroundOffset;
    float padding_0;
    float timeRaw;
    float time;
    float zoom;
    vec4 specularLightness;
    vec4 foamColor;
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
} _216;

uniform sampler2D waterNoiseTexture;
uniform sampler2D mask1Texture;
uniform sampler2D mask2Texture;
uniform sampler2D waterMaskTexture;

in vec4 maskUVs;
in vec2 vUV;
in vec4 vColor;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;

float fetchMaskTexture(sampler2D mask1Texture_1, sampler2D mask2Texture_1, vec4 maskUVs_1, float time)
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
                float wave = (sin((time * timeScale) + mask2UV.y) + 1.0) * 0.357142865657806396484375;
                mask = 1.0 - smoothstep(wave, wave + 0.300000011920928955078125, 1.0 - mask);
            }
        }
    }
    return mask;
}

float noise_func(vec2 uv)
{
    return texture(waterNoiseTexture, uv).x;
}

vec2 mul(vec2 v, mat2 m)
{
    return v * m;
}

vec2 rotate(inout vec2 uv)
{
    vec2 param = uv * 2.0;
    uv += vec2(noise_func(param) * 0.0199999995529651641845703125);
    float angle = 3.0;
    float sinRot = sin(angle);
    float cosRot = cos(angle);
    mat2 rotation = mat2(vec2(cosRot, -sinRot), vec2(sinRot, cosRot));
    vec2 param_1 = uv;
    mat2 param_2 = rotation;
    return mul(param_1, param_2);
}

float fbm(inout vec2 uv, float t)
{
    float f = 0.0;
    float total = 0.0;
    float mul_1 = 1.0;
    for (int i = 0; i < 3; i++)
    {
        vec2 param = uv + vec2((t * 0.0024999999441206455230712890625) * (1.0 - mul_1));
        f += (noise_func(param) * mul_1);
        total += mul_1;
        vec2 param_1 = uv * 1.10000002384185791015625;
        vec2 _196 = rotate(param_1);
        uv = _196;
        mul_1 *= 0.75;
    }
    return f / total;
}

vec4 MainPS()
{
    vec4 param = maskUVs;
    float param_1 = _216.timeRaw;
    float tileTransitionMask = fetchMaskTexture(mask1Texture, mask2Texture, param, param_1);
    vec2 uv = vUV;
    uv.y *= 1.414000034332275390625;
    vec2 param_2 = vec2(sin(_216.time * _216.animationSpeed) * _216.animationScale) + uv;
    float param_3 = _216.time;
    float _253 = fbm(param_2, param_3);
    float value = _253 + 0.100000001490116119384765625;
    vec3 mask = texelFetch(waterMaskTexture, ivec2(gl_FragCoord.xy), 0).xyz;
    float darks = 1.0 - ceil(value + _216.darkThreshold);
    float reflection = smoothstep(0.0, _216.reflectionThreshold, ((1.0 - (value * 0.800000011920928955078125)) - 0.60000002384185791015625) + (mask.x * 0.25));
    float specular = clamp(ceil((value + _216.specularThreshold) - mask.x), 1.0, 2.0);
    vec4 color = vec4(vColor.xyz * ((value + (specular * 0.189999997615814208984375)) - (mask.z * 0.300000011920928955078125)), vColor.w);
    color = mix(color, color * (_216.specularLightness * (-1.0)), vec4(darks * 0.10999999940395355224609375));
    vec3 color_reflect = mix(color.xyz, (color.xyz * color.xyz) * 1.5, vec3(clamp(reflection, 0.0, 0.5)));
    color = vec4(color_reflect, color.w);
    color *= (1.0 - mask.y);
    color = mix(color, _216.foamColor, vec4(smoothstep(-0.3499999940395355224609375, 0.300000011920928955078125, mask.z - (value * 2.150000095367431640625))));
    return color * tileTransitionMask;
}

void main()
{
    fragColor = MainPS();
    lightColor = vec4(0.0, 0.0, 0.0, fragColor.w * _216.lightmapAlpha);
}

