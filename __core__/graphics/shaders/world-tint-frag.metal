#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectUniforms
{
    float4 tintColorTop;
    float4 tintColorBottom;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _12 [[buffer(0)]])
{
    main0_out out = {};
    out.fragColor = mix(_12.tintColorBottom, _12.tintColorTop, float4(in.vUV.y));
    return out;
}

