#version 330

struct SpriteMask
{
    mat4 uvTransform;
    vec2 uvMin;
    vec2 uvMax;
    uint tint;
    uint extraData;
    vec2 padding_;
};

layout(std140) uniform spriteMaskUniforms
{
    vec4 vertices[4];
    uint tint;
    uint extraData;
    uint numMasks;
    float padding_;
    SpriteMask masks[4];
} _19;

layout(std140) uniform vsConstants
{
    mat4 projection;
} _37;

out vec2 vUV;
out vec4 vTint;
flat out uint vExtra;
out vec2 vMask0UV;
out vec2 vMask1UV;
out vec2 vMask2UV;
out vec2 vMask3UV;
layout(location = 0) in vec3 inPosition;
layout(location = 1) in vec2 uv;

void main()
{
    vec4 vert = _19.vertices[gl_VertexID & 3];
    gl_Position = _37.projection * vec4(vert.xy, 0.0, 1.0);
    vUV = vert.zw;
    vTint = vec4(float((_19.tint >> uint(0)) & 255u), float((_19.tint >> uint(8)) & 255u), float((_19.tint >> uint(16)) & 255u), float((_19.tint >> uint(24)) & 255u)) / vec4(255.0);
    vExtra = _19.extraData;
    vMask0UV = (_19.masks[0].uvTransform * vec4(vUV, 0.0, 1.0)).xy;
    vMask1UV = (_19.masks[1].uvTransform * vec4(vUV, 0.0, 1.0)).xy;
    vMask2UV = (_19.masks[2].uvTransform * vec4(vUV, 0.0, 1.0)).xy;
    vMask3UV = (_19.masks[3].uvTransform * vec4(vUV, 0.0, 1.0)).xy;
}

