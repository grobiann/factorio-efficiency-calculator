#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct blurConstants
{
    float4x4 projection;
    float4x4 model;
    float2 regionStart;
    float2 regionSize;
    float4 coeff0;
    float4 coeff1234;
    float2 direction;
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
float4 blur9(texture2d<float> image, sampler imageSmplr, thread const float2& uv, thread const float2& direction, constant blurConstants& _49)
{
    float4 color = float4(0.0);
    float2 off1 = float2(1.0) * direction;
    float2 off2 = float2(2.0) * direction;
    float2 off3 = float2(3.0) * direction;
    float2 off4 = float2(4.0) * direction;
    color += (image.sample(imageSmplr, uv) * _49.coeff0);
    color += (image.sample(imageSmplr, (uv + off1)) * _49.coeff1234.x);
    color += (image.sample(imageSmplr, (uv - off1)) * _49.coeff1234.x);
    color += (image.sample(imageSmplr, (uv + off2)) * _49.coeff1234.y);
    color += (image.sample(imageSmplr, (uv - off2)) * _49.coeff1234.y);
    color += (image.sample(imageSmplr, (uv + off3)) * _49.coeff1234.z);
    color += (image.sample(imageSmplr, (uv - off3)) * _49.coeff1234.z);
    color += (image.sample(imageSmplr, (uv + off4)) * _49.coeff1234.w);
    color += (image.sample(imageSmplr, (uv - off4)) * _49.coeff1234.w);
    return color;
}

fragment main0_out main0(main0_in in [[stage_in]], constant blurConstants& _49 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    float2 param = in.vUV;
    float2 param_1 = _49.direction;
    out.fragColor = blur9(tex, texSmplr, param, param_1, _49);
    return out;
}

