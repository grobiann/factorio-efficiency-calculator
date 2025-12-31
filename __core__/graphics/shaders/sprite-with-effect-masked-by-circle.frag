#version 330

uniform sampler2D tex1;
uniform sampler2D tex2;

flat in uint vExtra;
in vec4 vTint;
in vec2 vUV;
flat in vec2 vEffectOffset;
flat in vec2 vMinMaxRadius;
flat in float vFalloff;
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
        float _157;
        if (color.x < (0.5 * color.w))
        {
            _157 = x.x;
        }
        else
        {
            _157 = y.x;
        }
        color.x = _157;
        float _173;
        if (color.y < (0.5 * color.w))
        {
            _173 = x.y;
        }
        else
        {
            _173 = y.y;
        }
        color.y = _173;
        float _189;
        if (color.z < (0.5 * color.w))
        {
            _189 = x.z;
        }
        else
        {
            _189 = y.z;
        }
        color.z = _189;
        color.w = alpha;
    }
    if ((extra & 1u) != 0u)
    {
        vec4 _206 = color;
        vec3 _213 = vec3(dot(_206.xyz, vec3(0.2989999949932098388671875, 0.58700001239776611328125, 0.114000000059604644775390625)));
        color.x = _213.x;
        color.y = _213.y;
        color.z = _213.z;
    }
    return color;
}

vec4 applySpriteFlags(vec4 color)
{
    vec4 param = color;
    vec4 param_1 = vTint;
    uint param_2 = vExtra;
    vec4 _263 = applySpriteFlags(param, param_1, param_2);
    return _263;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _251 = bvec4((extra & 16u) != 0u);
    return vec4(_251.x ? vec4(0.0).x : color.x, _251.y ? vec4(0.0).y : color.y, _251.z ? vec4(0.0).z : color.z, _251.w ? vec4(0.0).w : color.w);
}

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _227;
    if ((extra & 48u) != 0u)
    {
        _227 = vec4(color.xyz, 0.0);
    }
    else
    {
        _227 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _227;
}

void main()
{
    vec4 color = texture(tex1, vUV);
    bool debug = (vExtra & 512u) != 0u;
    bool yCoCg = (vExtra & 256u) != 0u;
    if (yCoCg)
    {
        vec4 param = color;
        float param_1 = texture(tex2, vUV).x;
        color = YCoCgToRGB(param, param_1);
    }
    vec4 param_2 = color;
    color = applySpriteFlags(param_2);
    float d = distance(vEffectOffset, gl_FragCoord.xy);
    float r = clamp(d, vMinMaxRadius.x, vMinMaxRadius.y);
    float a = 1.0 - min(1.0, abs(d - r) / max(1.0, vFalloff));
    color *= a;
    vec4 param_3 = color;
    uint param_4 = vExtra;
    fragColor = getFragColor(param_3, param_4);
    vec4 param_5 = color;
    uint param_6 = vExtra;
    lightColor = getLightColor(param_5, param_6);
}

