#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float width;
    float height;
    float minIntensity;
    float maxIntensity;
    float uMul;
    float vMul;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _18 [[buffer(0)]])
{
    main0_out out = {};
    float2 a = (in.vUV - float2(0.5)) * float2(_18.uMul, _18.vMul);
    float d = length(a) * 2.0;
    d = fast::clamp(1.0 - d, 0.0, 1.0);
    d = mix(_18.minIntensity, _18.maxIntensity, d);
    float3 vDither = float3(dot(float2(171.0, 231.0), in.vUV * float2(_18.width, _18.height)));
    vDither = fract(vDither / float3(103.0, 71.0, 97.0)) - float3(0.5);
    out.fragColor = float4((vDither / float3(196.0)) + float3(d), 1.0);
    return out;
}

