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

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex [[texture(0)]], texture2d<float> mask [[texture(2)]], sampler texSmplr [[sampler(0)]], sampler maskSmplr [[sampler(2)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    out.fragColor = (in.vTint * tex.sample(texSmplr, in.vUV).x) * mask.read(uint2(int2(gl_FragCoord.xy)), 0);
    return out;
}

