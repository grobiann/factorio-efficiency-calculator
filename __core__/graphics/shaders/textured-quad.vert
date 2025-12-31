#version 330

layout(std140) uniform TexturedQuadConstants
{
    mat4 projection;
    vec2 destPosition;
    vec2 size;
    vec2 center;
    vec2 scale;
    float angle;
} _14;

layout(location = 0) in vec3 inPosition;
out vec2 vUV;
layout(location = 1) in vec2 uv;

void main()
{
    vec2 vX = vec2(cos(_14.angle), -sin(_14.angle));
    vec2 vY = vec2(sin(_14.angle), cos(_14.angle));
    vec2 position = ((inPosition.xy * 0.5) * _14.size) * _14.scale;
    position = vec2(dot(vX, position), dot(vY, position)) + ((_14.size * 0.5) * _14.scale);
    position = (_14.destPosition - (_14.center * _14.scale)) + position;
    gl_Position = _14.projection * vec4(position, inPosition.z, 1.0);
    vUV = uv;
}

