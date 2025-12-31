#version 330

layout(std140) uniform passParams
{
    float passTime;
} _156;

uniform sampler2D mask1Texture;
uniform sampler2D atlasTexture;

flat in uint vFlags;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
in vec3 vTint;
layout(location = 1) out vec4 lightColor;

vec4 getFragColor(vec4 color, vec3 tint, uint flags)
{
    vec4 finalColor = vec4(color.xyz * tint, color.w);
    bvec4 _48 = bvec4((flags & 4u) != 0u);
    return vec4(_48.x ? vec4(0.0).x : finalColor.x, _48.y ? vec4(0.0).y : finalColor.y, _48.z ? vec4(0.0).z : finalColor.z, _48.w ? vec4(0.0).w : finalColor.w);
}

vec4 getLightColor(vec4 color, float mask, uint flags)
{
    if ((flags & 36u) != 0u)
    {
        return vec4(color.xyz * (mask * mask), 0.0);
    }
    float _73;
    if ((flags & 64u) == 0u)
    {
        _73 = color.w;
    }
    else
    {
        _73 = 0.0;
    }
    return vec4(0.0, 0.0, 0.0, _73);
}

void main()
{
    float mask = textureLod(mask1Texture, (gl_FragCoord.xy * 0.25) / vec2(textureSize(mask1Texture, 0)), 0.0).w;
    mask = mix(float(((vFlags & 65280u) >> uint(8)) >> uint(1)) / 127.0, 1.0, mask);
    if ((vFlags & 256u) == 0u)
    {
        mask = 1.0;
    }
    vec4 color = texture(atlasTexture, vUV) * mask;
    vec4 param = color;
    vec3 param_1 = vTint;
    uint param_2 = vFlags;
    fragColor = getFragColor(param, param_1, param_2);
    vec4 param_3 = color;
    float param_4 = 1.0;
    uint param_5 = vFlags;
    lightColor = getLightColor(param_3, param_4, param_5);
}

