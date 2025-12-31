#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct vsConstants
{
    float4x4 projection;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float4 vTint [[user(locn1)]];
    uint vExtra [[user(locn2)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 srcPos [[attribute(0)]];
    float2 srcSize [[attribute(1)]];
    float2 dstPos [[attribute(2)]];
    float2 inScale [[attribute(3)]];
    float inOrientation [[attribute(4)]];
    float4 tint [[attribute(5)]];
    uint flags [[attribute(7)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _148 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    float2 texSize = float2(int2(tex.get_width(), tex.get_height()));
    uint vertexID = uint(int(gl_VertexIndex)) % 4u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 corner = float2(float(i), float(j));
    float2 center = in.srcSize * 0.5;
    float _59;
    if ((in.flags & 256u) != 0u)
    {
        _59 = -in.inScale.x;
    }
    else
    {
        _59 = in.inScale.x;
    }
    float _75;
    if ((in.flags & 512u) != 0u)
    {
        _75 = -in.inScale.y;
    }
    else
    {
        _75 = in.inScale.y;
    }
    float2 scale = float2(_59, _75);
    float2 c = (-center) * scale;
    float2 d = in.srcSize * scale;
    float angle = in.inOrientation * 6.283185482025146484375;
    float sinA = sin(angle);
    float cosA = cos(angle);
    float2 pos = c + (d * corner);
    float x = ((cosA * pos.x) - (sinA * pos.y)) + in.dstPos.x;
    float y = ((sinA * pos.x) + (cosA * pos.y)) + in.dstPos.y;
    out.gl_Position = _148.projection * float4(x, y, 0.0, 1.0);
    out.vUV = (in.srcPos + (corner * in.srcSize)) / texSize;
    float4 _176;
    if ((in.flags & 65536u) != 0u)
    {
        _176 = float4(0.0, 0.0, 0.0, in.tint.w);
    }
    else
    {
        _176 = in.tint;
    }
    out.vTint = _176;
    out.vExtra = in.flags & 255u;
    return out;
}

