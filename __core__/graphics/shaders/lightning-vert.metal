#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct LightningProperties
{
    float4x4 mvp;
    float4 initialColor;
    float distortion;
    float initialThickness;
    float power;
    float time;
};

struct main0_out
{
    float2 vPosition [[user(locn0)]];
    float2 vUV [[user(locn1)]];
    float vIntensity [[user(locn2)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    float intensity [[attribute(2)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant LightningProperties& _19 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = _19.mvp * float4(in.position, 0.0, 1.0);
    out.vPosition = in.position;
    out.vUV = in.uv;
    out.vIntensity = in.intensity;
    return out;
}

