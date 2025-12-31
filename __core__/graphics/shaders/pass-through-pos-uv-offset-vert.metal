#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct vsConstants
{
    float2 offset;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _23 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = float4(in.position + float3(_23.offset, 0.0), 1.0);
    out.vUV = in.uv;
    return out;
}

