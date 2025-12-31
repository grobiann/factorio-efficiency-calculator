#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _19;

layout(location = 0) in vec2 position;
layout(location = 1) in vec2 uv;
layout(location = 2) in uvec2 masks;
layout(location = 3) in uint flags;

void main()
{
    gl_Position = _19.projection * vec4(position, 0.0, 1.0);
}

