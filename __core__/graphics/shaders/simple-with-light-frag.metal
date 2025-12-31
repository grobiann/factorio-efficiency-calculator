#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex [[texture(0)]], texture2d<float> lightTex [[texture(1)]], sampler texSmplr [[sampler(0)]], sampler lightTexSmplr [[sampler(1)]])
{
    main0_out out = {};
    out.fragColor = tex.sample(texSmplr, in.vUV);
    out.lightColor = lightTex.sample(lightTexSmplr, in.vUV);
    return out;
}

