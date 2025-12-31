#version 330

uniform sampler3D lut;
uniform sampler2D tex1;
uniform sampler2D tex2;

flat in uint vExtra;
in vec4 vTint;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;

vec3 colorToLut16Index(vec3 inputColor)
{
    return (inputColor * 0.9375) + vec3(0.03125);
}

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
        float _116;
        if (color.x < (0.5 * color.w))
        {
            _116 = x.x;
        }
        else
        {
            _116 = y.x;
        }
        color.x = _116;
        float _133;
        if (color.y < (0.5 * color.w))
        {
            _133 = x.y;
        }
        else
        {
            _133 = y.y;
        }
        color.y = _133;
        float _149;
        if (color.z < (0.5 * color.w))
        {
            _149 = x.z;
        }
        else
        {
            _149 = y.z;
        }
        color.z = _149;
        color.w = alpha;
    }
    if (all(bvec2((extra & 8u) != 0u, color.w > 0.0)))
    {
        vec3 param = color.xyz;
        vec3 _184 = textureLod(lut, colorToLut16Index(param), 0.0).xyz;
        color.x = _184.x;
        color.y = _184.y;
        color.z = _184.z;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _196 = color;
        vec3 _203 = vec3(dot(_196.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _203.x;
        color.y = _203.y;
        color.z = _203.z;
    }
    return color;
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _252 = applySpriteFlags(param, param_1, param_2);
    return _252;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _240 = bvec4((extra & 16u) != 0u);
    return vec4(_240.x ? vec4(0.0).x : color.x, _240.y ? vec4(0.0).y : color.y, _240.z ? vec4(0.0).z : color.z, _240.w ? vec4(0.0).w : color.w);
}

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _217;
    if ((extra & 48u) != 0u)
    {
        _217 = vec4(color.xyz, 0.0);
    }
    else
    {
        _217 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _217;
}

void main()
{
    vec4 param = texture(tex1, vUV);
    vec4 color = applySpriteFlags(param);
    vec4 param_1 = color;
    uint param_2 = vExtra;
    fragColor = getFragColor(param_1, param_2);
    vec4 param_3 = color;
    uint param_4 = vExtra;
    lightColor = getLightColor(param_3, param_4);
}

