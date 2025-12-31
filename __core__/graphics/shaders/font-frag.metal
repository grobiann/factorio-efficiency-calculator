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
    float4 vColor [[user(locn1), flat]];
};

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> atlasTexture [[texture(0)]], sampler atlasTextureSmplr [[sampler(0)]])
{
    main0_out out = {};
    float4 texColor = atlasTexture.sample(atlasTextureSmplr, in.vUV);
    out.fragColor = in.vColor * texColor.x;
    return out;
}

