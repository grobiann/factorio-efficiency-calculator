#version 330

layout(std140) uniform EffectUniforms
{
    vec4 tintColorTop;
    vec4 tintColorBottom;
} _12;

layout(location = 0) out vec4 fragColor;
in vec2 vUV;
in vec4 vColor;

void main()
{
    fragColor = mix(_12.tintColorBottom, _12.tintColorTop, vec4(vUV.y));
}

