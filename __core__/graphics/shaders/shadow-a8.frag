#version 330

layout(std140) uniform fsConstants
{
    float shadowOpacity;
} _25;

uniform sampler2D tex;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;

void main()
{
    float shadow = texture(tex, vUV).w * _25.shadowOpacity;
    fragColor = vec4(0.0, 0.0, 0.0, shadow);
}

