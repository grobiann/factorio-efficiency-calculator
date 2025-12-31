#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float4x4 colorMatrix;
    float brightness;
    float contrast;
    float saturation;
    float factor;
    float summand;
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
float3x3 saturationMatrix(thread const float& saturation)
{
    float3 luminance = float3(0.308600008487701416015625, 0.609399974346160888671875, 0.08200000226497650146484375);
    float oneMinusSat = 1.0 - saturation;
    float3 red = float3(luminance.x * oneMinusSat);
    red.x += saturation;
    float3 green = float3(luminance.y * oneMinusSat);
    green.y += saturation;
    float3 blue = float3(luminance.z * oneMinusSat);
    blue.z += saturation;
    return float3x3(float3(red), float3(green), float3(blue));
}

static inline __attribute__((always_inline))
void brightnessAdjust(thread float4& color, thread const float& b)
{
    float4 _92 = color;
    float3 _98 = powr(fast::max(float3(0.0), _92.xyz), float3(1.0 - b));
    color.x = _98.x;
    color.y = _98.y;
    color.z = _98.z;
}

static inline __attribute__((always_inline))
void contrastAdjust(thread float4& color, thread const float& c)
{
    float t = 0.5 - (c * 0.5);
    float4 _110 = color;
    float3 _116 = (_110.xyz * c) + float3(t);
    color.x = _116.x;
    color.y = _116.y;
    color.z = _116.z;
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _137 [[buffer(0)]], texture2d<float> source [[texture(0)]], sampler sourceSmplr [[sampler(0)]])
{
    main0_out out = {};
    float4 color = source.sample(sourceSmplr, in.vUV);
    float4 _143 = color;
    float3 _153 = fast::clamp(_137.colorMatrix * float4(_143.xyz, 1.0), float4(0.0), float4(1.0)).xyz;
    color.x = _153.x;
    color.y = _153.y;
    color.z = _153.z;
    if (_137.saturation != 1.0)
    {
        float param = _137.saturation;
        float4 _172 = color;
        float3 _174 = saturationMatrix(param) * _172.xyz;
        color.x = _174.x;
        color.y = _174.y;
        color.z = _174.z;
    }
    float4 param_1 = color;
    float param_2 = _137.brightness;
    brightnessAdjust(param_1, param_2);
    color = param_1;
    float4 param_3 = color;
    float param_4 = _137.contrast;
    contrastAdjust(param_3, param_4);
    color = param_3;
    out.fragColor = color;
    return out;
}

