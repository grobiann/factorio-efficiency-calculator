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
    if (dfdx(in.vUV).x <= 0.00048828125)
    {
        float2 coord = floor(in.vUV * 2048.0);
        int rgb5 = int(tex1.read(uint2(int2(coord)), 0).x);
        int param = rgb5;
        float3 _69 = unpackRGB565(param) * in.vTintWith565Multiplier.xyz;
        out.fragColor.x = _69.x;
        out.fragColor.y = _69.y;
        out.fragColor.z = _69.z;
    }
    else
    {
        float2 chunkID = floor(in.vUV * 64.0);
        float2 pixelOffset = (in.vUV * 64.0) - chunkID;
        float2 f = (pixelOffset * 32.0) - float2(0.5);
        float2 uv0 = floor(f);
        float2 uv1 = uv0 + float2(1.0);
        f -= uv0;
        uv0 = fast::max(uv0, float2(0.0));
        uv1 = fast::min(uv1, float2(31.0));
        uv0 += (chunkID * 32.0);
        uv1 += (chunkID * 32.0);
        int c00 = int(tex1.read(uint2(int2(int(uv0.x), int(uv0.y))), 0).x);
        int c10 = int(tex1.read(uint2(int2(int(uv1.x), int(uv0.y))), 0).x);
        int c01 = int(tex1.read(uint2(int2(int(uv0.x), int(uv1.y))), 0).x);
        int c11 = int(tex1.read(uint2(int2(int(uv1.x), int(uv1.y))), 0).x);
        int param_1 = c00;
        int param_2 = c10;
        int param_3 = c01;
        int param_4 = c11;
        float3 c = mix(mix(unpackRGB565(param_1), unpackRGB565(param_2), float3(f.x)), mix(unpackRGB565(param_3), unpackRGB565(param_4), float3(f.x)), float3(f.y));
        float3 _206 = c * in.vTintWith565Multiplier.xyz;
        out.fragColor.x = _206.x;
        out.fragColor.y = _206.y;
        out.fragColor.z = _206.z;
    }
    out.fragColor.w = in.vTintWith565Multiplier.w;
    return out;
}

