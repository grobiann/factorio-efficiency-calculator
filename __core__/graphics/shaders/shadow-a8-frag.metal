#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float shadowOpacity;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _25 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    float shadow = tex.sample(texSmplr, in.vUV).w * _25.shadowOpacity;
    out.fragColor = float4(0.0, 0.0, 0.0, shadow);
    return out;
}

