#version 330

uniform sampler2D tex;
uniform sampler2D lightTex;

layout(location = 0) out vec4 fragColor;
in vec2 vUV;
layout(location = 1) out vec4 lightColor;

void main()
{
    fragColor = texture(tex, vUV);
    lightColor = texture(lightTex, vUV);
}

