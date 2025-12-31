#version 330

layout(std140) uniform passParams
{
    float passTime;
} _232;

uniform sampler2D atlasTexture;
uniform sampler2D atlasAlpha;
uniform sampler2D mask1Texture;
uniform sampler2D mask2Texture;

in vec2 vUV;
in vec4 maskUVs;
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

vec4 YCoCgToRGB(vec4 ycocg, float alpha)
{
    float Y = ycocg.w;
    float scale = 1.0 / ((31.875 * ycocg.z) + 1.0);
    float Co = (ycocg.x - 0.501960813999176025390625) * scale;
    float Cg = (ycocg.y - 0.501960813999176025390625) * scale;
    float R = (Y + Co) - Cg;
    float G = Y + Cg;
    float B = (Y - Co) - Cg;
    return vec4(R, G, B, alpha);
}

vec4 getFragColor(vec4 color, vec3 tint, uint flags)
{
    vec4 finalColor = vec4(color.xyz * tint, color.w);
    bvec4 _112 = bvec4((flags & 4u) != 0u);
    return vec4(_112.x ? vec4(0.0).x : finalColor.x, _112.y ? vec4(0.0).y : finalColor.y, _112.z ? vec4(0.0).z : finalColor.z, _112.w ? vec4(0.0).w : finalColor.w);
}

vec4 getLightColor(vec4 color, float mask, uint flags)
{
    if ((flags & 36u) != 0u)
    {
        return vec4(color.xyz * (mask * mask), 0.0);
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
    return vec4(0.0, 0.0, 0.0, _137);
}

void main()
{
    vec4 yCoCg = texture(atlasTexture, vUV);
    float alpha = texture(atlasAlpha, vUV).x;
    vec4 param = maskUVs;
    float param_1 = _232.passTime;
    float mask = fetchMaskTexture(mask1Texture, mask2Texture, param, param_1);
    vec4 param_2 = yCoCg;
    float param_3 = alpha;
    vec4 color = YCoCgToRGB(param_2, param_3) * mask;
    vec4 param_4 = color;
    vec3 param_5 = vTint;
    uint param_6 = vFlags;
    fragColor = getFragColor(param_4, param_5, param_6);
    vec4 param_7 = color;
    float param_8 = mask;
    uint param_9 = vFlags;
    lightColor = getLightColor(param_7, param_8, param_9);
}

