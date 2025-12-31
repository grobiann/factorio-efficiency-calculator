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
    float vFalloff [[user(locn3)]];
    float2 vEffectOffset [[user(locn4)]];
    float2 vMinMaxRadius [[user(locn5)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    float4 tint [[attribute(2)]];
    uint extra [[attribute(3)]];
    uint2 uData [[attribute(4)]];
    float4 fData [[attribute(5)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _19 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 0.0, 1.0);
    out.vUV = in.uv;
    out.vTint = in.tint;
    out.vExtra = in.extra;
    out.vFalloff = as_type<float>(in.uData.x);
    out.vEffectOffset = in.fData.xy;
    out.vMinMaxRadius = in.fData.zw;
    return out;
}

