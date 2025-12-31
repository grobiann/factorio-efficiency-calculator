#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct blurConstants
{
    float4x4 projection;
    float4x4 model;
    float2 regionStart;
    float2 regionSize;
    float4 coeff0;
    float4 coeff1234;
    float2 direction;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant blurConstants& _20 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = (_20.projection * _20.model) * float4(in.position, 0.0, 1.0);
    out.vUV = _20.regionStart + (in.uv * _20.regionSize);
    return out;
}

