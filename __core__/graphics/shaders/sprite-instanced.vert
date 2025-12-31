#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _148;

uniform sampler2D tex;

layout(location = 1) in vec2 srcSize;
layout(location = 7) in uint flags;
layout(location = 3) in vec2 inScale;
layout(location = 4) in float inOrientation;
layout(location = 2) in vec2 dstPos;
out vec2 vUV;
layout(location = 0) in vec2 srcPos;
out vec4 vTint;
layout(location = 5) in vec4 tint;
flat out uint vExtra;
layout(location = 6) in uint extra;

void main()
{
    vec2 texSize = vec2(textureSize(tex, 0));
    uint vertexID = uint(gl_VertexID) % 4u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    vec2 corner = vec2(float(i), float(j));
    vec2 center = srcSize * 0.5;
    float _59;
    if ((flags & 256u) != 0u)
    {
        _59 = -inScale.x;
    }
    else
    {
        _59 = inScale.x;
    }
    float _75;
    if ((flags & 512u) != 0u)
    {
        _75 = -inScale.y;
    }
    else
    {
        _75 = inScale.y;
    }
    vec2 scale = vec2(_59, _75);
    vec2 c = (-center) * scale;
    vec2 d = srcSize * scale;
    float angle = inOrientation * 6.283185482025146484375;
    float sinA = sin(angle);
    float cosA = cos(angle);
    vec2 pos = c + (d * corner);
    float x = ((cosA * pos.x) - (sinA * pos.y)) + dstPos.x;
    float y = ((sinA * pos.x) + (cosA * pos.y)) + dstPos.y;
    gl_Position = _148.projection * vec4(x, y, 0.0, 1.0);
    vUV = (srcPos + (corner * srcSize)) / texSize;
    vec4 _176;
    if ((flags & 65536u) != 0u)
    {
        _176 = vec4(0.0, 0.0, 0.0, tint.w);
    }
    else
    {
        _176 = tint;
    }
    vTint = _176;
    vExtra = flags & 255u;
}

