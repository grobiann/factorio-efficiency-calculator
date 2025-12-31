#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float4 vTint [[user(locn1)]];
};

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex1 [[texture(0)]], sampler tex1Smplr [[sampler(0)]])
{
    main0_out out = {};
    out.fragColor = in.vTint * tex1.sample(tex1Smplr, in.vUV).x;
    return out;
}

