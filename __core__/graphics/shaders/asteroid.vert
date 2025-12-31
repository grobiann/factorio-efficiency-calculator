#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _19;

layout(location = 0) in vec3 position;
out vec2 vDiffuseUV;
layout(location = 1) in vec2 diffuseUV;
out vec2 vNormalUV;
layout(location = 2) in vec2 normalUV;
out vec2 vRoughnessUV;
layout(location = 3) in vec2 roughnessUV;
flat out float vAngle;
layout(location = 4) in float angle;
flat out float vOpacity;
layout(location = 5) in float opacity;

void main()
{
    gl_Position = _19.projection * vec4(position, 1.0);
    vDiffuseUV = diffuseUV;
    vNormalUV = normalUV;
    vRoughnessUV = roughnessUV;
    vAngle = angle;
    vOpacity = opacity;
}

