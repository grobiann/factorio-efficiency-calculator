#version 330

layout(std140) uniform vsConstants
{
    vec2 offset;
} _23;

layout(location = 0) in vec3 position;
out vec2 vUV;
layout(location = 1) in vec2 uv;

void main()
{
    gl_Position = vec4(position + vec3(_23.offset, 0.0), 1.0);
    vUV = uv;
}

