#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

// Implementation of the GLSL mod() function, which is slightly different than Metal fmod()
template<typename Tx, typename Ty>
inline Tx mod(Tx x, Ty y)
{
    return x - y * floor(x / y);
}

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
    float vignetteIntensity;
    float vignetteSharpness;
    float borderSize;
    float borderOffset;
    float noiseIntensity;
    uint noiseMask;
    float horizontalLinesIntensity;
    uint horizontalLinesMask;
    float scanLinesFlickerIntensity;
    uint scanLinesFlickerMask;
    float saturation;
    uint saturationMask;
    uint colorMask;
    uint curved;
    float4 color;
    float lineWidth;
    float guiScale;
    float brightness;
    float gapBetweenLinesWidth;
    float crtEffectIntensity;
    uint crtEffectMask;
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

static inline __attribute__((always_inline))
float4 fetchPixel(thread const float2& uv, constant fsConstants& _105, texture2d<float> gameview, sampler gameviewSmplr, texture3d<float> lut1, sampler lut1Smplr, texture2d<float> lightmap, sampler lightmapSmplr, texture2d<float> detailLightmap, sampler detailLightmapSmplr)
{
    float4 color = gameview.sample(gameviewSmplr, uv);
    float3 param = color.xyz;
    float3 lookupIndex = colorToLut16Index(param);
    float4 sunlitColor = float4(lut1.sample(lut1Smplr, lookupIndex, level(0.0)).xyz, color.w);
    float4 light = lightmap.sample(lightmapSmplr, uv) + detailLightmap.sample(detailLightmapSmplr, uv);
    light = fast::clamp(light, float4(0.0), float4(1.0));
    float4 _255 = light;
    float3 _266 = (_255.xyz * float3(_105.lightMul)) + float3(_105.lightAdd);
    light.x = _266.x;
    light.y = _266.y;
    light.z = _266.z;
    float4 c = mix(sunlitColor, color, light);
    return c;
}

static inline __attribute__((always_inline))
float4 getColor(thread const float2& uv, constant fsConstants& _105, texture2d<float> gameview, sampler gameviewSmplr, texture3d<float> lut1, sampler lut1Smplr, texture2d<float> lightmap, sampler lightmapSmplr, texture2d<float> detailLightmap, sampler detailLightmapSmplr)
{
    float2 param = uv;
    return fetchPixel(param, _105, gameview, gameviewSmplr, lut1, lut1Smplr, lightmap, lightmapSmplr, detailLightmap, detailLightmapSmplr);
}

static inline __attribute__((always_inline))
float vignette(thread const float2& p, thread const float& intensity, thread const float& sharpness)
{
    float2 uv = p * (float2(1.0) - p.yx);
    float vig = (uv.x * uv.y) * intensity;
    return fast::clamp(powr(abs(vig), sharpness), 0.0, 1.0);
}

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
float3 getnoise3(thread const float2& p, constant fsConstants& _105)
{
    float param = p.x;
    float param_1 = p.y;
    float param_2 = floor(_105.timer / 3.0);
    return float3(hash3(param, param_1, param_2));
}

static inline __attribute__((always_inline))
float stripes(thread const float2& uv, constant fsConstants& _105)
{
    float width = _105.lineWidth;
    float offset = 0.0;
    float y = (uv.y * _105.resolution.y) + offset;
    y = floor(y / width);
    return float(uint(y) & 1u);
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _105 [[buffer(0)]], texture2d<float> gameview [[texture(0)]], texture2d<float> lightmap [[texture(1)]], texture2d<float> detailLightmap [[texture(2)]], texture3d<float> lut1 [[texture(3)]], sampler gameviewSmplr [[sampler(0)]], sampler lightmapSmplr [[sampler(1)]], sampler detailLightmapSmplr [[sampler(2)]], sampler lut1Smplr [[sampler(3)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float2 uv = in.vUV;
    float2 param = uv;
    float4 finalColor = getColor(param, _105, gameview, gameviewSmplr, lut1, lut1Smplr, lightmap, lightmapSmplr, detailLightmap, detailLightmapSmplr);
    float a1 = 0.0;
    float2 param_1 = uv;
    float param_2 = _105.vignetteIntensity;
    float param_3 = _105.vignetteSharpness;
    float a2 = 1.0 - vignette(param_1, param_2, param_3);
    a2 = fast::clamp(a2 * _105.zoom_to_world_params.x, 0.0, 1.0);
    float intensity = a2;
    float param_4 = mix(1.0, _105.saturation, intensity);
    float4 _347 = finalColor;
    float3 _349 = saturationMatrix(param_4) * _347.xyz;
    finalColor.x = _349.x;
    finalColor.y = _349.y;
    finalColor.z = _349.z;
    float2 cor;
    cor.x = gl_FragCoord.x / 1.0;
    cor.y = (gl_FragCoord.y + (1.5 * mod(floor(cor.x), 2.0))) / 3.0;
    float2 ico = floor(cor);
    float2 fco = fract(cor);
    float3 pix = step(float3(1.5), mod(float3(0.0, 1.0, 2.0) + float3(ico.x), float3(3.0)));
    float2 param_5 = ((ico * 1.0) * float2(1.0, 3.0)) / _105.resolution;
    float3 ima = getColor(param_5, _105, gameview, gameviewSmplr, lut1, lut1Smplr, lightmap, lightmapSmplr, detailLightmap, detailLightmapSmplr).xyz;
    float3 col = pix * dot(pix, ima);
    col *= step(abs(fco.x - 0.5), 0.4000000059604644775390625);
    col *= step(abs(fco.y - 0.5), 0.4000000059604644775390625);
    col *= 1.2000000476837158203125;
    float t = a2;
    float4 _431 = finalColor;
    float3 _440 = mix(_431.xyz, col, float3(t * _105.crtEffectIntensity));
    finalColor.x = _440.x;
    finalColor.y = _440.y;
    finalColor.z = _440.z;
    float4 _447 = finalColor;
    float2 param_6 = uv;
    float3 _458 = mix(_447.xyz, getnoise3(param_6, _105), float3(_105.noiseIntensity * a2));
    finalColor.x = _458.x;
    finalColor.y = _458.y;
    finalColor.z = _458.z;
    float2 param_7 = uv;
    float s = stripes(param_7, _105);
    float t_1 = a2;
    float4 _480 = finalColor;
    float3 _482 = _480.xyz * (1.0 + ((t_1 * _105.brightness) * (1.0 - s)));
    finalColor.x = _482.x;
    finalColor.y = _482.y;
    finalColor.z = _482.z;
    float4 _497 = finalColor;
    float3 _499 = _497.xyz * (1.0 - ((t_1 * _105.horizontalLinesIntensity) * s));
    finalColor.x = _499.x;
    finalColor.y = _499.y;
    finalColor.z = _499.z;
    out.fragColor = finalColor;
    return out;
}

