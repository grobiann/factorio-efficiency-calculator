#version 330

uniform sampler3D lut;
uniform sampler2D tex1;
uniform sampler2D tex2;

flat in uint vExtra;
in vec4 vTint;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;

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
        float _121;
        if (color.x < (0.5 * color.w))
        {
            _121 = x.x;
        }
        else
        {
            _121 = y.x;
        }
        color.x = _121;
        float _138;
        if (color.y < (0.5 * color.w))
        {
            _138 = x.y;
        }
        else
        {
            _138 = y.y;
        }
        color.y = _138;
        float _154;
        if (color.z < (0.5 * color.w))
        {
            _154 = x.z;
        }
        else
        {
            _154 = y.z;
        }
        color.z = _154;
        color.w = alpha;
    }
    if (all(bvec2((extra & 8u) != 0u, color.w > 0.0)))
    {
        vec3 param = color.xyz;
        vec3 _189 = textureLod(lut, colorToLut16Index(param), 0.0).xyz;
        color.x = _189.x;
        color.y = _189.y;
        color.z = _189.z;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _201 = color;
        vec3 _208 = vec3(dot(_201.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _208.x;
        color.y = _208.y;
        color.z = _208.z;
    }
    return color;
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _257 = applySpriteFlags(param, param_1, param_2);
    return _257;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _245 = bvec4((extra & 16u) != 0u);
    return vec4(_245.x ? vec4(0.0).x : color.x, _245.y ? vec4(0.0).y : color.y, _245.z ? vec4(0.0).z : color.z, _245.w ? vec4(0.0).w : color.w);
}

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _222;
    if ((extra & 48u) != 0u)
    {
        _222 = vec4(color.xyz, 0.0);
    }
    else
    {
        _222 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _222;
}

void main()
{
    vec4 yCoCg = texture(tex1, vUV);
    float alpha = texture(tex2, vUV).x;
    vec4 param = yCoCg;
    float param_1 = alpha;
    vec4 param_2 = YCoCgToRGB(param, param_1);
    vec4 color = applySpriteFlags(param_2);
    vec4 param_3 = color;
    uint param_4 = vExtra;
    fragColor = getFragColor(param_3, param_4);
    vec4 param_5 = color;
    uint param_6 = vExtra;
    lightColor = getLightColor(param_5, param_6);
}

