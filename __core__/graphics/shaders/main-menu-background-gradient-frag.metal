#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float width;
    float height;
    float minIntensity;
    float maxIntensity;
    float uMul;
    float vMul;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

static inline __attribute__((always_inline))
float vignette(thread const float2& p, constant fsConstants& _33)
{
    float2 uv = p * (float2(1.0) - p.yx);
    float vig = (uv.x * uv.y) * _33.minIntensity;
    return powr(abs(vig), _33.maxIntensity);
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _33 [[buffer(0)]])
{
    main0_out out = {};
    float2 param = in.vUV;
    float a = vignette(param, _33);
    out.fragColor = float4(0.0, 0.0, 0.0, 1.0 - a);
    return out;
}

