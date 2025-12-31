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
    float4 vColor [[user(locn0)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float4 color [[attribute(3)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _24 [[buffer(0)]])
{
    main0_out out = {};
    out.vColor = in.color;
    out.gl_Position = _24.projection * float4(in.position, 0.0, 1.0);
    return out;
}

