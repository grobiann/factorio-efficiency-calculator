#version 330

struct SpriteMask
{
    mat4 uvTransform;
    vec2 uvMin;
    vec2 uvMax;
    uint tint;
    uint extraData;
    vec2 padding_;
};

layout(std140) uniform spriteMaskUniforms
{
    vec4 vertices[4];
    uint tint;
    uint extraData;
    uint numMasks;
    float padding_;
    SpriteMask masks[4];
} _239;

uniform sampler2D mask0;
uniform sampler2D mask1;
uniform sampler2D mask2;
uniform sampler2D mask3;
uniform sampler2D tex;

flat in uint vExtra;
in vec4 vTint;
in vec2 vMask0UV;
in vec2 vMask1UV;
in vec2 vMask2UV;
in vec2 vMask3UV;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;

vec4 applySpriteFlags(inout vec4 color, vec4 tint, uint extra)
{
    if ((vExtra & 4u) != 0u)
    {
        color = vec4(color.www - color.xyz, color.w);
    }
    if ((vExtra & 2u) == 0u)
    {
        color *= tint;
    }
    else
    {
        float alpha = color.w * tint.w;
        vec3 x = (color.xyz * tint.xyz) * 2.0;
        vec3 y = vec3(alpha) - (((vec3(color.w) - color.xyz) * 2.0) * (vec3(tint.w) - tint.xyz));
        float _122;
        if (color.x < (0.5 * color.w))
        {
            _122 = x.x;
        }
        else
        {
            _122 = y.x;
        }
        color.x = _122;
        float _139;
        if (color.y < (0.5 * color.w))
        {
            _139 = x.y;
        }
        else
        {
            _139 = y.y;
        }
        color.y = _139;
        float _155;
        if (color.z < (0.5 * color.w))
        {
            _155 = x.z;
        }
        else
        {
            _155 = y.z;
        }
        color.z = _155;
        color.w = alpha;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _172 = color;
        vec3 _179 = vec3(dot(_172.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _179.x;
        color.y = _179.y;
        color.z = _179.z;
    }
    return color;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _217 = bvec4((extra & 16u) != 0u);
    return vec4(_217.x ? vec4(0.0).x : color.x, _217.y ? vec4(0.0).y : color.y, _217.z ? vec4(0.0).z : color.z, _217.w ? vec4(0.0).w : color.w);
}

vec4 textureMask(int maskIndex, sampler2D maskTex, vec2 uv)
{
    float clamp = ((step(_239.masks[maskIndex].uvMin.x, uv.x) * step(uv.x, _239.masks[maskIndex].uvMax.x)) * step(_239.masks[maskIndex].uvMin.y, uv.y)) * step(uv.y, _239.masks[maskIndex].uvMax.y);
    vec4 maskColor = texture(maskTex, uv);
    vec4 tint = vec4(float((_239.masks[maskIndex].tint >> uint(0)) & 255u), float((_239.masks[maskIndex].tint >> uint(8)) & 255u), float((_239.masks[maskIndex].tint >> uint(16)) & 255u), float((_239.masks[maskIndex].tint >> uint(24)) & 255u)) / vec4(255.0);
    vec4 param = maskColor;
    vec4 param_1 = tint;
    uint param_2 = _239.masks[maskIndex].extraData;
    vec4 _320 = applySpriteFlags(param, param_1, param_2);
    vec4 param_3 = _320;
    uint param_4 = vExtra;
    return getFragColor(param_3, param_4) * clamp;
}

vec4 blend(vec4 underColor, vec4 overColor)
{
    return overColor + (underColor * (1.0 - overColor.w));
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _229 = applySpriteFlags(param, param_1, param_2);
    return _229;
}

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _193;
    if ((extra & 48u) != 0u)
    {
        _193 = vec4(color.xyz, 0.0);
    }
    else
    {
        _193 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _193;
}

void main()
{
    vec4 maskColor = vec4(0.0);
    if (_239.numMasks >= 1u)
    {
        int param = 0;
        vec2 param_1 = vMask0UV;
        maskColor = textureMask(param, mask0, param_1);
    }
    if (_239.numMasks >= 2u)
    {
        int param_2 = 1;
        vec2 param_3 = vMask1UV;
        vec4 param_4 = maskColor;
        vec4 param_5 = textureMask(param_2, mask1, param_3);
        maskColor = blend(param_4, param_5);
    }
    if (_239.numMasks >= 3u)
    {
        int param_6 = 2;
        vec2 param_7 = vMask2UV;
        vec4 param_8 = maskColor;
        vec4 param_9 = textureMask(param_6, mask2, param_7);
        maskColor = blend(param_8, param_9);
    }
    if (_239.numMasks >= 4u)
    {
        int param_10 = 3;
        vec2 param_11 = vMask3UV;
        vec4 param_12 = maskColor;
        vec4 param_13 = textureMask(param_10, mask3, param_11);
        maskColor = blend(param_12, param_13);
    }
    vec4 spriteColor = texture(tex, vUV);
    vec4 param_14 = spriteColor;
    vec4 color = applySpriteFlags(param_14);
    vec4 param_15 = color;
    vec4 param_16 = maskColor;
    color = blend(param_15, param_16);
    bool _414 = maskColor.w < 1.0;
    bool _420;
    if (_414)
    {
        _420 = spriteColor.w > 0.0;
    }
    else
    {
        _420 = _414;
    }
    color *= float(_420);
    vec4 param_17 = color;
    uint param_18 = vExtra;
    fragColor = getFragColor(param_17, param_18);
    vec4 param_19 = color;
    uint param_20 = vExtra;
    lightColor = getLightColor(param_19, param_20);
}

