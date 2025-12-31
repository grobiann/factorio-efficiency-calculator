#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _24;

out vec4 vColor;
layout(location = 3) in vec4 color;
layout(location = 0) in vec2 position;

void main()
{
    vColor = color;
    gl_Position = _24.projection * vec4(position, 0.0, 1.0);
}

