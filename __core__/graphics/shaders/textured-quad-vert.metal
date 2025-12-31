#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct TexturedQuadConstants
{
    float4x4 projection;
    float2 destPosition;
    float2 size;
    float2 center;
    float2 scale;
    float angle;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 inPosition [[attribute(0)]];
    float2 uv [[attribute(1)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant TexturedQuadConstants& _14 [[buffer(0)]])
{
    main0_out out = {};
    float2 vX = float2(cos(_14.angle), -sin(_14.angle));
    float2 vY = float2(sin(_14.angle), cos(_14.angle));
    float2 position = ((in.inPosition.xy * 0.5) * _14.size) * _14.scale;
    position = float2(dot(vX, position), dot(vY, position)) + ((_14.size * 0.5) * _14.scale);
    position = (_14.destPosition - (_14.center * _14.scale)) + position;
    out.gl_Position = _14.projection * float4(position, in.inPosition.z, 1.0);
    out.vUV = in.uv;
    return out;
}

