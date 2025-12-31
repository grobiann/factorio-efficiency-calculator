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
};

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> diffuseMap [[texture(0)]], sampler diffuseMapSmplr [[sampler(0)]])
{
    main0_out out = {};
    float4 color = diffuseMap.sample(diffuseMapSmplr, in.vUV);
    out.fragColor = float4(0.0, 0.0, 0.0, color.w);
    return out;
}

