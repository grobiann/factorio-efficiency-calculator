#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float2 invShadowTexSize;
    float time;
    float inverseExpectedUVDerivativeTimesStrength;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float4 vTint [[user(locn1)]];
};

static inline __attribute__((always_inline))
float hmix(thread const float& a, thread const float& b)
{
    return fract(sin((a * 12.98980045318603515625) + b) * 43758.546875);
}

static inline __attribute__((always_inline))
float hash3(thread const float& a, thread const float& b, thread const float& c)
{
    float param = a;
    float param_1 = b;
    float ab = hmix(param, param_1);
    float param_2 = a;
    float param_3 = c;
    float ac = hmix(param_2, param_3);
    float param_4 = b;
    float param_5 = c;
    float bc = hmix(param_4, param_5);
    float param_6 = ac;
    float param_7 = bc;
    float param_8 = ab;
    float param_9 = hmix(param_6, param_7);
    return hmix(param_8, param_9);
}

static inline __attribute__((always_inline))
float getnoise(thread const float2& p, thread const float& time)
{
    float param = p.x;
    float param_1 = p.y;
    float param_2 = time;
    return hash3(param, param_1, param_2);
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _112 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    out.fragColor = in.vTint * tex.sample(texSmplr, in.vUV).x;
    float2 localUV = in.vUV * float2(int2(tex.get_width(), tex.get_height()));
    float2 param = floor(localUV);
    float param_1 = floor(_112.time);
    float2 param_2 = floor(localUV.yx);
    float param_3 = floor(_112.time);
    float2 past = float2(getnoise(param, param_1), getnoise(param_2, param_3));
    float2 param_4 = floor(localUV);
    float param_5 = ceil(_112.time);
    float2 param_6 = floor(localUV.yx);
    float param_7 = ceil(_112.time);
    float2 next = float2(getnoise(param_4, param_5), getnoise(param_6, param_7));
    float2 offset = (mix(past, next, float2(fract(_112.time))) * 2.0) - float2(1.0);
    offset *= (dfdx(localUV.x) * _112.inverseExpectedUVDerivativeTimesStrength);
    out.fragColor = in.vTint * tex.sample(texSmplr, ((localUV + offset) * _112.invShadowTexSize)).x;
    return out;
}

