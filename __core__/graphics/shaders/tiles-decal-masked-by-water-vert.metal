#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct vsConstants
{
    float4x4 projection;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    uint vFlags [[user(locn1)]];
    float3 vTint [[user(locn2)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    uint flags [[attribute(3)]];
};

static inline __attribute__((always_inline))
float3 unpackRGB565(thread const int& rgb5)
{
    return float3(int3(rgb5) & int3(63488, 2016, 31));
}

static inline __attribute__((always_inline))
float3 decodeRGB565(thread const int& rgb5)
{
    int param = rgb5;
    return unpackRGB565(param) * float3(1.5751007595099508762359619140625e-05, 0.0004960317746736109256744384765625, 0.0322580635547637939453125);
}

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _68 [[buffer(0)]])
{
    main0_out out = {};
    out.vFlags = in.flags;
    int param = int(in.flags >> uint(16));
    out.vTint = decodeRGB565(param);
    out.vUV = in.uv;
    out.gl_Position = _68.projection * float4(in.position, 0.0, 1.0);
    return out;
}

