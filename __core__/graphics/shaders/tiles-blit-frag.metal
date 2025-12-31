#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectUniforms
{
    float2 resolution;
    float2 backgroundOffset;
    float2 padding_0;
    float time;
    float zoom;
    float scaleFactor;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

fragment main0_out main0(constant EffectUniforms& _22 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    out.fragColor = tex.sample(texSmplr, ((gl_FragCoord.xy / _22.resolution) * _22.scaleFactor));
    return out;
}

