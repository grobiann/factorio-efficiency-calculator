#version 330

layout(std140) uniform territoryOverlayUniforms
{
    mat4 projection;
    vec4 stripeColor;
    vec4 softBorderColor;
    vec4 solidBorderColor;
    float stripeWidth;
    float softBorderWidth;
    float solidBorderWidth;
    float stripeShift;
} _19;

layout(location = 0) in vec2 position;
out vec2 vUV;
layout(location = 1) in vec2 uv;
flat out uint chunkData;
layout(location = 2) in uint inChunkData;

void main()
{
    gl_Position = _19.projection * vec4(position, 0.0, 1.0);
    vUV = uv;
    chunkData = inChunkData;
}

