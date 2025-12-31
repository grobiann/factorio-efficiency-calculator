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
    float4 color [[user(locn1)]];
    float time [[user(locn2)]];
    float fusionPower [[user(locn3)]];
    float plasmaLevel [[user(locn4)]];
    float quality [[user(locn5)]];
    float randomSeed [[user(locn6)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    float4 tint [[attribute(2)]];
    uint2 uData [[attribute(4)]];
    float4 fData [[attribute(5)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _19 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 0.0, 1.0);
    out.vUV = in.uv;
    out.color = in.tint;
    out.time = in.fData.x;
    out.fusionPower = in.fData.y;
    out.plasmaLevel = in.fData.z;
    out.quality = as_type<float>(in.uData.x);
    out.randomSeed = as_type<float>(in.uData.y);
    return out;
}

