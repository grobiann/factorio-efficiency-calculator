#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _19;

layout(location = 0) in vec2 position;
out vec2 vUV;
layout(location = 1) in vec2 uv;
out float vOpacity;
layout(location = 2) in vec4 tint;
flat out uint vExtra;
layout(location = 3) in uint extra;
flat out float vFalloff;
layout(location = 4) in uvec2 uData;
layout(location = 5) in vec4 fData;
flat out vec2 vRectSize;
out vec2 vRelativePosition;

void main()
{
    gl_Position = _19.projection * vec4(position, 0.0, 1.0);
    vUV = uv;
    vOpacity = tint.w;
    vExtra = extra;
    vFalloff = uintBitsToFloat(uData.x);
    vec2 rectLeftTop = fData.xy;
    vec2 rectRightBottom = fData.zw;
    vRectSize = abs(rectRightBottom - rectLeftTop) * 0.5;
    vRelativePosition = position - ((rectLeftTop * 0.5) + (rectRightBottom * 0.5));
}

