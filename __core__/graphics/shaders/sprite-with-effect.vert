#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _19;

layout(location = 0) in vec2 position;
out vec2 vUV;
layout(location = 1) in vec2 uv;
out vec4 vTint;
layout(location = 2) in vec4 tint;
flat out uint vExtra;
layout(location = 3) in uint extra;
flat out float vFalloff;
layout(location = 4) in uvec2 uData;
flat out vec2 vEffectOffset;
layout(location = 5) in vec4 fData;
flat out vec2 vMinMaxRadius;

void main()
{
    gl_Position = _19.projection * vec4(position, 0.0, 1.0);
    vUV = uv;
    vTint = tint;
    vExtra = extra;
    vFalloff = uintBitsToFloat(uData.x);
    vEffectOffset = fData.xy;
    vMinMaxRadius = fData.zw;
}

