#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _19;

layout(location = 0) in vec2 position;
out vec2 vUV;
layout(location = 1) in vec2 uv;
out vec4 color;
layout(location = 2) in vec4 tint;
flat out float time;
layout(location = 5) in vec4 fData;
flat out float fusionPower;
flat out float plasmaLevel;
flat out float quality;
layout(location = 4) in uvec2 uData;
flat out float randomSeed;
layout(location = 3) in uint extra;

void main()
{
    gl_Position = _19.projection * vec4(position, 0.0, 1.0);
    vUV = uv;
    color = tint;
    time = fData.x;
    fusionPower = fData.y;
    plasmaLevel = fData.z;
    quality = uintBitsToFloat(uData.x);
    randomSeed = uintBitsToFloat(uData.y);
}

