#version 330

uniform sampler3D lut;
uniform sampler2D tex1;
uniform sampler2D tex2;

flat in uint vExtra;
in vec4 vTint;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;

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
        float _112;
        if (color.x < (0.5 * color.w))
        {
            _112 = x.x;
        }
        else
        {
            _112 = y.x;
        }
        color.x = _112;
        float _129;
        if (color.y < (0.5 * color.w))
        {
            _129 = x.y;
        }
        else
        {
            _129 = y.y;
        }
        color.y = _129;
        float _145;
        if (color.z < (0.5 * color.w))
        {
            _145 = x.z;
        }
        else
        {
            _145 = y.z;
        }
        color.z = _145;
        color.w = alpha;
    }
    if (all(bvec2((extra & 8u) != 0u, color.w > 0.0)))
    {
        vec3 param = color.xyz;
        vec3 _180 = textureLod(lut, colorToLut16Index(param), 0.0).xyz;
        color.x = _180.x;
        color.y = _180.y;
        color.z = _180.z;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _192 = color;
        vec3 _199 = vec3(dot(_192.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _199.x;
        color.y = _199.y;
        color.z = _199.z;
    }
    return color;
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _217 = applySpriteFlags(param, param_1, param_2);
    return _217;
}

void main()
{
    vec4 yCoCg = texture(tex1, vUV);
    float alpha = texture(tex2, vUV).x;
    vec4 param = yCoCg;
    float param_1 = alpha;
    vec4 param_2 = YCoCgToRGB(param, param_1);
    vec4 color = applySpriteFlags(param_2);
    fragColor = color;
}

