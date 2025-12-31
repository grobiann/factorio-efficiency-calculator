#version 330

uniform sampler2D diffuseMap;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;

void main()
{
    vec4 color = texture(diffuseMap, vUV);
    fragColor = vec4(0.0, 0.0, 0.0, color.w);
}

