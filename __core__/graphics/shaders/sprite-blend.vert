#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _59;

uniform samplerBuffer uvLookup;

layout(location = 0) in vec3 position;
out vec2 vUV1;
layout(location = 1) in vec2 ratioAndIndex;
out vec2 vUV2;
layout(location = 3) in uint extra;
out vec4 vTint;
layout(location = 2) in vec4 tint;
flat out uint vExtra;
flat out float vRatio;

vec2 fetchUV(int uvLookupIndex)
{
    uint vertexID = uint(gl_VertexID) % 4u;
    vec4 uvCoords = texelFetch(uvLookup, uvLookupIndex);
    return uvCoords.xy + (vec2(float(vertexID / 2u), float(vertexID % 2u)) * uvCoords.zw);
}

void main()
{
    gl_Position = _59.projection * vec4(position, 1.0);
    int param = int(ratioAndIndex.y);
    vUV1 = fetchUV(param);
    int param_1 = int(extra >> uint(8));
    vUV2 = fetchUV(param_1);
    vTint = tint;
    vExtra = extra & 255u;
    vRatio = ratioAndIndex.x;
}

