#version 330

layout(std140) uniform passParams
{
    float passTime;
} _167;

uniform sampler2D mask1Texture;
uniform sampler2D mask2Texture;
uniform sampler2D atlasTexture;

in vec4 maskUVs;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
in vec3 vTint;
flat in uint vFlags;
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

vec4 getFragColor(vec4 color, vec3 tint, uint flags)
{
    vec4 finalColor = vec4(color.xyz * tint, color.w);
    bvec4 _58 = bvec4((flags & 4u) != 0u);
    return vec4(_58.x ? vec4(0.0).x : finalColor.x, _58.y ? vec4(0.0).y : finalColor.y, _58.z ? vec4(0.0).z : finalColor.z, _58.w ? vec4(0.0).w : finalColor.w);
}

vec4 getLightColor(vec4 color, float mask, uint flags)
{
    if ((flags & 36u) != 0u)
    {
        return vec4(color.xyz * (mask * mask), 0.0);
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
    return vec4(0.0, 0.0, 0.0, _83);
}

void main()
{
    vec4 param = maskUVs;
    float param_1 = _167.passTime;
    float mask = fetchMaskTexture(mask1Texture, mask2Texture, param, param_1);
    vec4 color = texture(atlasTexture, vUV) * mask;
    vec4 param_2 = color;
    vec3 param_3 = vTint;
    uint param_4 = vFlags;
    fragColor = getFragColor(param_2, param_3, param_4);
    vec4 param_5 = color;
    float param_6 = mask;
    uint param_7 = vFlags;
    lightColor = getLightColor(param_5, param_6, param_7);
}

