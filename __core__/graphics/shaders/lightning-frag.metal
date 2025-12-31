#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct LightningProperties
{
    float4x4 mvp;
    float4 initialColor;
    float distortion;
    float initialThickness;
    float power;
    float time;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vPosition [[user(locn0)]];
    float2 vUV [[user(locn1)]];
    float vIntensity [[user(locn2)]];
};

static inline __attribute__((always_inline))
float valueOverTime(thread const float& start, thread const float& end, thread const float& power, constant LightningProperties& _215)
{
    return powr((_215.time - start) / (end - start), power);
}

static inline __attribute__((always_inline))
float valueOverTime(thread const float& start, thread const float& end, constant LightningProperties& _215)
{
    return (_215.time - start) / (end - start);
}

static inline __attribute__((always_inline))
float random(thread const float2& st)
{
    float s = dot(st, float2(12.345600128173828125, 34.141498565673828125));
    return fract(sin(s) * 45678.8984375);
}

static inline __attribute__((always_inline))
float perlinNoise(thread const float2& st)
{
    float2 cell = floor(st);
    float2 cell2 = ceil(st);
    float2 f = fract(st);
    float2 param = cell;
    float s00 = random(param);
    float2 param_1 = float2(cell.x, cell2.y);
    float s01 = random(param_1);
    float2 param_2 = float2(cell2.x, cell.y);
    float s10 = random(param_2);
    float2 param_3 = cell2;
    float s11 = random(param_3);
    return mix(mix(s00, s10, f.x), mix(s01, s11, f.x), f.y);
}

static inline __attribute__((always_inline))
float3 noise3D(thread float2& vPosition)
{
    float3 _noise = float3(0.0);
    for (int i = 1; i <= 4; i++)
    {
        float iscale = powr(2.0, float(i - 1));
        float2 param = (vPosition * iscale) * 30.0;
        float2 param_1 = vPosition + float2(76.4499969482421875);
        float2 param_2 = param_1;
        param.x += (perlinNoise(param_2) * 0.20000000298023223876953125);
        float2 param_2_1 = vPosition + float2(91.0);
        float2 param_3 = param_2_1;
        param.y += (perlinNoise(param_3) * 0.20000000298023223876953125);
        float influence = 1.0 / powr(float(i), 2.0);
        float2 param_3_1 = param + float2(23.6499996185302734375);
        float2 param_4 = param_3_1;
        _noise.x += (perlinNoise(param_4) * influence);
        float2 param_4_1 = param + float2(12.340000152587890625);
        float2 param_5 = param_4_1;
        _noise.y += (perlinNoise(param_5) * influence);
        float2 param_5_1 = param + float2(82.339996337890625);
        float2 param_6 = param_5_1;
        _noise.z += (perlinNoise(param_6) * influence);
    }
    float3 _207 = _noise;
    float3 _208 = _207 - float3(0.5);
    _noise = _208;
    return _208;
}

fragment main0_out main0(main0_in in [[stage_in]], constant LightningProperties& _215 [[buffer(0)]])
{
    main0_out out = {};
    float param = 0.0;
    float param_1 = 0.300000011920928955078125;
    float param_2 = 0.75;
    if ((length(in.vPosition) - 0.100000001490116119384765625) > valueOverTime(param, param_1, param_2, _215))
    {
        out.fragColor = float4(0.0);
        return out;
    }
    bool _262 = in.vIntensity != 1.0;
    bool _268;
    if (_262)
    {
        _268 = in.vPosition.y < 0.20000000298023223876953125;
    }
    else
    {
        _268 = _262;
    }
    bool isCloud = _268;
    float growth;
    if (isCloud)
    {
        float param_3 = 0.0;
        float param_4 = 0.20000000298023223876953125;
        growth = ((1.0 - length(in.vPosition)) - valueOverTime(param_3, param_4, _215)) - 0.20000000298023223876953125;
    }
    else
    {
        float param_5 = 0.0;
        float param_6 = 0.300000011920928955078125;
        float param_7 = 0.75;
        growth = length(in.vPosition) - valueOverTime(param_5, param_6, param_7, _215);
    }
    growth = fast::min(fast::max(0.0500000007450580596923828125 - growth, 0.0) * 50.0, 1.0);
    float thickness = _215.initialThickness * growth;
    float opacity = _215.initialColor.w;
    float3 color = _215.initialColor.xyz;
    float param_8 = 0.20000000298023223876953125;
    float param_9 = 0.300000011920928955078125;
    float bolt = length(in.vPosition) - valueOverTime(param_8, param_9, _215);
    if (isCloud)
    {
        float param_10 = 0.0;
        float param_11 = 0.300000011920928955078125;
        bolt = ((1.0 - length(in.vPosition)) - valueOverTime(param_10, param_11, _215)) - 0.300000011920928955078125;
    }
    bolt *= ((bolt > 0.0) ? 4.0 : (-0.100000001490116119384765625));
    bolt = fast::max(powr((0.1500000059604644775390625 - bolt) * 7.0, 3.0), 0.0);
    bolt = mix(0.0, bolt, powr(in.vIntensity, 1.5));
    bolt -= (fast::max(in.vPosition.y - 0.949999988079071044921875, 0.0) * 20.0);
    if (bolt > 0.0)
    {
        thickness = mix(thickness, powr(thickness, 0.20000000298023223876953125) * 5.0, bolt * 0.5);
        color = mix(color, float3(0.800000011920928955078125, 0.0, 0.0) + color, float3(powr(bolt, 0.5)));
    }
    float3 _noise = noise3D(in.vPosition);
    float gradient = fast::clamp(2.0 * abs(in.vUV.x - 0.5), 0.0, 1.0);
    float2 distortedUV = in.vUV + (((_noise.xy * _215.distortion) * in.vIntensity) * fast::max(1.0 - (bolt * 0.5), 0.0));
    float distorted_bolt = fast::clamp(2.0 * abs(distortedUV.x - 0.5), 0.0, 1.0);
    float distorted_opacity = mix(opacity, opacity - _noise.x, _215.time);
    distorted_opacity *= (1.0 - powr(gradient, 4.0));
    color = fast::normalize(color);
    color += ((float3(1.0) * (1.0 - powr(gradient, 0.699999988079071044921875))) * distorted_opacity);
    color += ((_noise * 0.300000011920928955078125) * (1.0 - powr(gradient, 4.0)));
    out.fragColor = float4(fast::max(thickness - distorted_bolt, 0.0));
    float min_value = fast::max(mix(mix(0.0500000007450580596923828125, 0.0005000000237487256526947021484375, opacity), 0.0, bolt), 0.0);
    float factor = ((((-distorted_bolt) + 0.300000011920928955078125) + (bolt * 0.5)) + opacity) - 1.0;
    factor = powr(fast::max(factor, 0.0), 2.0);
    out.fragColor *= mix(min_value, 1.0, factor);
    float4 _477 = out.fragColor;
    float3 _479 = _477.xyz * color;
    out.fragColor.x = _479.x;
    out.fragColor.y = _479.y;
    out.fragColor.z = _479.z;
    out.fragColor = fast::min(powr(out.fragColor, float4(_215.power)), float4(1.0));
    out.fragColor *= distorted_opacity;
    float4 _502 = out.fragColor;
    float3 _504 = _502.xyz * mix(float3(0.0), color, float3(1.0 - distorted_bolt));
    out.fragColor.x = _504.x;
    out.fragColor.y = _504.y;
    out.fragColor.z = _504.z;
    out.fragColor *= (1.0 + fast::min(bolt, 0.5));
    out.fragColor *= ((in.vPosition.y + 0.75) / 1.75);
    return out;
}

