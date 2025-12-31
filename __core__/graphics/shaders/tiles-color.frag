#version 330

layout(location = 0) out vec4 fragColor;
in vec4 vColor;
layout(location = 1) out vec4 lightColor;

void main()
{
    fragColor = vColor;
    lightColor = vec4(0.0, 0.0, 0.0, 1.0);
}

