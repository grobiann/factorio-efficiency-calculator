#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct turretRangeData
{
    uint dataSize;
    float4 color;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant turretRangeData& _47 [[buffer(0)]], texture2d<float> pretest [[texture(0)]], sampler pretestSmplr [[sampler(0)]])
{
    main0_out out = {};
    float a = pretest.sample(pretestSmplr, in.vUV).w;
    if (a == 0.0)
    {
        out.fragColor = float4(0.0);
        return out;
    }
    if (a == 1.0)
    {
        float4 _40;
        if (false)
        {
            _40 = float4(1.0, 1.0, 0.0, 1.0);
        }
        else
        {
            _40 = _47.color;
        }
        out.fragColor = _40;
        return out;
    }
    discard_fragment();
    return out;
}

