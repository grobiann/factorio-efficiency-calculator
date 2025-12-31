#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct territoryOverlayUniforms
{
    float4x4 projection;
    float4 stripeColor;
    float4 softBorderColor;
    float4 solidBorderColor;
    float stripeWidth;
    float softBorderWidth;
    float solidBorderWidth;
    float stripeShift;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    uint chunkData [[user(locn1)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    uint inChunkData [[attribute(2)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant territoryOverlayUniforms& _19 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 0.0, 1.0);
    out.vUV = in.uv;
    out.chunkData = in.inChunkData;
    return out;
}

