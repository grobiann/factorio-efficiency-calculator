#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

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
    float4 vTintWith565Multiplier [[user(locn1)]];
};

static inline __attribute__((always_inline))
float3 unpackRGB565(thread const int& rgb5)
{
    return float3(int3(rgb5) & int3(63488, 2016, 31));
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<uint> tex1 [[texture(0)]], sampler tex1Smplr [[sampler(0)]])
{
    main0_out out = {};
    int2 size = int2(tex1.get_width(), tex1.get_height());
    float2 coord = floor(in.vUV * float2(size));
    int rgb5 = int(tex1.read(uint2(int2(coord)), 0).x);
    int param = rgb5;
    float3 _67 = unpackRGB565(param) * in.vTintWith565Multiplier.xyz;
    out.fragColor.x = _67.x;
    out.fragColor.y = _67.y;
    out.fragColor.z = _67.z;
    out.fragColor.w = in.vTintWith565Multiplier.w;
    return out;
}

