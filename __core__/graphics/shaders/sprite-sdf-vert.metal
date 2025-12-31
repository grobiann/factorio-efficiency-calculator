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
    float2 vUV1 [[user(locn0)]];
    float2 vUV2 [[user(locn1)]];
    float4 vTint [[user(locn2)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 position [[attribute(0)]];
    float2 uv1 [[attribute(1)]];
    float4 tint [[attribute(2)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _19 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 1.0);
    out.vUV1 = in.uv1;
    out.vUV2 = in.uv1;
    out.vTint = in.tint;
    return out;
}

