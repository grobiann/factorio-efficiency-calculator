#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float4 globalColor;
    float2 atlasSize;
    float minDist;
    float maxDist;
    float radius;
    float sharpness;
    float inset;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV1 [[user(locn0)]];
    float4 vTint [[user(locn2)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _30 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    float dist = tex.sample(texSmplr, in.vUV1).x;
    out.fragColor = in.vTint * smoothstep(_30.minDist, _30.maxDist, dist);
    return out;
}

