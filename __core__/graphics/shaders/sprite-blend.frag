#version 330

uniform sampler2D tex1;
uniform sampler2D tex2;

flat in uint vExtra;
in vec4 vTint;
in vec2 vUV1;
in vec2 vUV2;
flat in float vRatio;
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
        float _104;
        if (color.x < (0.5 * color.w))
        {
            _104 = x.x;
        }
        else
        {
            _104 = y.x;
        }
        color.x = _104;
        float _121;
        if (color.y < (0.5 * color.w))
        {
            _121 = x.y;
        }
        else
        {
            _121 = y.y;
        }
        color.y = _121;
        float _137;
        if (color.z < (0.5 * color.w))
        {
            _137 = x.z;
        }
        else
        {
            _137 = y.z;
        }
        color.z = _137;
        color.w = alpha;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _154 = color;
        vec3 _161 = vec3(dot(_154.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _161.x;
        color.y = _161.y;
        color.z = _161.z;
    }
    return color;
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _211 = applySpriteFlags(param, param_1, param_2);
    return _211;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _199 = bvec4((extra & 16u) != 0u);
    return vec4(_199.x ? vec4(0.0).x : color.x, _199.y ? vec4(0.0).y : color.y, _199.z ? vec4(0.0).z : color.z, _199.w ? vec4(0.0).w : color.w);
}

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _175;
    if ((extra & 48u) != 0u)
    {
        _175 = vec4(color.xyz, 0.0);
    }
    else
    {
        _175 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _175;
}

void main()
{
    vec4 param = mix(texture(tex1, vUV1), texture(tex2, vUV2), vec4(vRatio));
    vec4 color = applySpriteFlags(param);
    vec4 param_1 = color;
    uint param_2 = vExtra;
    fragColor = getFragColor(param_1, param_2);
    vec4 param_3 = color;
    uint param_4 = vExtra;
    lightColor = getLightColor(param_3, param_4);
}

