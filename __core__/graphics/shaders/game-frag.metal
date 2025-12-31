#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float2 zoom_to_world_params;
    float timer;
    float lutSize;
    float2 resolution;
    float unused_was_lutAlpha;
    float lightMul;
    float lightAdd;
    uint debugShowLut;
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
float3 colorToLut16Index(thread const float3& inputColor)
{
    return (inputColor * 0.9375) + float3(0.03125);
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _92 [[buffer(0)]], texture2d<float> gameview [[texture(0)]], texture2d<float> lightmap [[texture(1)]], texture2d<float> detailLightmap [[texture(2)]], texture3d<float> sunLut [[texture(3)]], texture3d<float> lightLut [[texture(4)]], sampler gameviewSmplr [[sampler(0)]], sampler lightmapSmplr [[sampler(1)]], sampler detailLightmapSmplr [[sampler(2)]], sampler sunLutSmplr [[sampler(3)]], sampler lightLutSmplr [[sampler(4)]])
{
    main0_out out = {};
    float2 uv = in.vUV;
    float4 color = gameview.sample(gameviewSmplr, uv);
    float3 param = color.xyz;
    float3 lookupIndex = colorToLut16Index(param);
    float4 sunlitColor = float4(sunLut.sample(sunLutSmplr, lookupIndex, level(0.0)).xyz, color.w);
    float4 artificiallyLitColor = float4(lightLut.sample(lightLutSmplr, lookupIndex, level(0.0)).xyz, color.w);
    float4 light = lightmap.sample(lightmapSmplr, uv) + detailLightmap.sample(detailLightmapSmplr, uv);
    light = fast::clamp(light, float4(0.0), float4(1.0));
    float4 _88 = light;
    float3 _104 = (_88.xyz * float3(_92.lightMul)) + float3(_92.lightAdd);
    light.x = _104.x;
    light.y = _104.y;
    light.z = _104.z;
    float4 finalColor = mix(sunlitColor, artificiallyLitColor, light);
    out.fragColor = finalColor;
    return out;
}

