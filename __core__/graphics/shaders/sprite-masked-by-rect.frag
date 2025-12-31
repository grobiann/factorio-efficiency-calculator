#version 330

uniform sampler2D tex1;
uniform sampler2D tex2;

in vec2 vRelativePosition;
flat in vec2 vRectSize;
in vec2 vUV;
flat in uint vExtra;
flat in float vFalloff;
in float vOpacity;
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

float getDist()
{
    vec2 d = abs(vRelativePosition) - vRectSize;
    return length(max(d, vec2(0.0)));
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
    float d = getDist() / vFalloff;
    float a = 1.0 - min(1.0, d);
    color *= (vOpacity * a);
    fragColor = color;
}

