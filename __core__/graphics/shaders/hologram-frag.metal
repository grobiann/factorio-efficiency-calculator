#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float2 resolution;
    float secondsSinceGameLaunch;
    uint tick;
    float opacity;
    float guiScale;
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
float seconds(constant fsConstants& _34)
{
    return _34.secondsSinceGameLaunch;
}

static inline __attribute__((always_inline))
float jitterActive(constant fsConstants& _34)
{
    float sinSample = sin(seconds(_34) * 0.139644443988800048828125);
    float timingActive = step(0.997777760028839111328125, sinSample);
    float fadeInActive = abs(1.0 - step(1.0, _34.opacity));
    return step(1.0, timingActive + fadeInActive);
}

static inline __attribute__((always_inline))
float2 jitterUvs(thread float2& uv, constant fsConstants& _34)
{
    float bigWobble = sin((uv.y * 15.0) + (seconds(_34) * 2.0)) / 100.0;
    float smallJitter = 1.0 + (sin(seconds(_34) * 100.0) / 2.0);
    uv.x += (jitterActive(_34) * (bigWobble * smallJitter));
    return uv;
}

static inline __attribute__((always_inline))
float stripes(thread const float2& uv, constant fsConstants& _34)
{
    float width = ceil(2.0 * _34.guiScale);
    float offset = seconds(_34) * 20.0;
    float y = (uv.y * _34.resolution.y) + offset;
    y = floor(y / width);
    return float(uint(y) & 1u);
}

static inline __attribute__((always_inline))
float4 alphaBlend(thread const float4& src, thread const float4& dest)
{
    float3 _137 = mix(dest.xyz, src.xyz, float3(src.w));
    float4 ret;
    ret.x = _137.x;
    ret.y = _137.y;
    ret.z = _137.z;
    ret.w = src.w + ((1.0 - src.w) * dest.w);
    return ret;
}

static inline __attribute__((always_inline))
float flickerAlpha()
{
    return 1.0;
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _34 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    float2 param = in.vUV;
    float2 _165 = jitterUvs(param, _34);
    float2 uv = _165;
    float4 texSample = tex.sample(texSmplr, uv);
    float2 param_1 = uv;
    float4 stripesColor = float4(1.0, 1.0, 1.0, stripes(param_1, _34) * 0.3499999940395355224609375);
    float4 param_2 = stripesColor;
    float4 param_3 = texSample;
    float4 texWithStripes = alphaBlend(param_2, param_3);
    float pick = 1.0 - step(1.0, 1.0 - texSample.w);
    out.fragColor = mix(texSample, texWithStripes, float4(pick));
    out.fragColor.w *= flickerAlpha();
    out.fragColor.w *= _34.opacity;
    return out;
}

