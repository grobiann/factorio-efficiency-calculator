#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float4 tint;
    float lutAlpha;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

fragment main0_out main0(constant fsConstants& _63 [[buffer(0)]], texture3d<float> lut1 [[texture(0)]], texture3d<float> lut2 [[texture(1)]], sampler lut1Smplr [[sampler(0)]], sampler lut2Smplr [[sampler(1)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    int3 lu = int3(int2(gl_FragCoord.xy), 0);
    lu.z = lu.x >> 4;
    lu.x &= 15;
    lu.y = lu.y;
    float4 lut1Color = lut1.read(uint3(lu), 0);
    float4 lut2Color = lut2.read(uint3(lu), 0);
    out.fragColor = fast::clamp(mix(lut1Color, lut2Color, float4(_63.lutAlpha)) * _63.tint, float4(0.0), float4(1.0));
    return out;
}

