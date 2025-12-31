#version 330

uniform sampler3D lut;
uniform sampler2D tex1;
uniform sampler2D tex2;

flat in uint vExtra;
in vec4 vTint;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;

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
        float _107;
        if (color.x < (0.5 * color.w))
        {
            _107 = x.x;
        }
        else
        {
            _107 = y.x;
        }
        color.x = _107;
        float _124;
        if (color.y < (0.5 * color.w))
        {
            _124 = x.y;
        }
        else
        {
            _124 = y.y;
        }
        color.y = _124;
        float _140;
        if (color.z < (0.5 * color.w))
        {
            _140 = x.z;
        }
        else
        {
            _140 = y.z;
        }
        color.z = _140;
        color.w = alpha;
    }
    if (all(bvec2((extra & 8u) != 0u, color.w > 0.0)))
    {
        vec3 param = color.xyz;
        vec3 _175 = textureLod(lut, colorToLut16Index(param), 0.0).xyz;
        color.x = _175.x;
        color.y = _175.y;
        color.z = _175.z;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _187 = color;
        vec3 _194 = vec3(dot(_187.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _194.x;
        color.y = _194.y;
        color.z = _194.z;
    }
    return color;
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _212 = applySpriteFlags(param, param_1, param_2);
    return _212;
}

void main()
{
    vec4 param = texture(tex1, vUV);
    vec4 color = applySpriteFlags(param);
    fragColor = color;
}

