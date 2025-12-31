#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectUniforms
{
    float2 resolution;
    float2 backgroundOffset;
    float2 padding_0;
    float time;
    float zoom;
    float nebulaScale;
    float scrollFactor;
    float nebulaBrightness;
    float nebulaSaturation;
    float2 backgroundOffsetScaled;
    float unscaleFactor;
    float padding_01;
    int debugOption;
    float padding_02;
    float2 padding_03;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

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
float3 generate_nebula(constant EffectUniforms& _93, thread float4& gl_FragCoord)
{
    float2 uv = _93.backgroundOffsetScaled + ((gl_FragCoord.xy - (_93.resolution * 0.5)) * _93.unscaleFactor);
    float3 nebula = float3(0.0);
    float2 nebulaUV = uv * _93.nebulaScale;
    float nebula_mask_sum = 0.0;
    float dark_nebula_g = 0.0;
    for (int i = 1; i <= 7; i++)
    {
        float iscale = float(1 << i);
        float2 param = nebulaUV * iscale;
        float2 param_1 = (nebulaUV * 5.0) + float2(76.43399810791015625);
        param.x += (perlinNoise(param_1) * 0.20000000298023223876953125);
        float2 param_2 = (nebulaUV * 5.0) + float2(91.2570037841796875);
        param.y += (perlinNoise(param_2) * 0.20000000298023223876953125);
        float angle = 0.4000000059604644775390625;
        param.x = (param.x * cos(angle)) - (param.y * sin(angle));
        param.y = (param.x * sin(angle)) + (param.y * cos(angle));
        float influence = 1.0 / powr(float(i), 2.0);
        float2 param_3 = param + float2(23.6529998779296875);
        nebula.x += (perlinNoise(param_3) * influence);
        float2 param_4 = param + float2(12.34500026702880859375);
        nebula.y += (perlinNoise(param_4) * influence);
        float2 param_5 = param + float2(34.14099884033203125);
        nebula.z += (perlinNoise(param_5) * influence);
        float2 param_6 = (param / float2(2.0)) + float2(36.673999786376953125);
        float2 param_7 = (param / float2(2.0)) + float2(46.325000762939453125);
        float2 param_8 = (param / float2(2.0)) + float2(75.2350006103515625);
        nebula_mask_sum += (((perlinNoise(param_6) * influence) + (perlinNoise(param_7) * influence)) + (perlinNoise(param_8) * influence));
        float2 param_9 = (param * 2.0) + float2(23.6529998779296875);
        dark_nebula_g += (perlinNoise(param_9) * influence);
    }
    float mask = nebula_mask_sum / 3.0;
    mask = fast::max((0.449999988079071044921875 * mask) - 0.300000011920928955078125, 0.0);
    float BW_nebula = ((nebula.x + nebula.y) + nebula.z) / 3.0;
    nebula = (nebula * _93.nebulaSaturation) + float3(BW_nebula * (1.0 - _93.nebulaSaturation));
    nebula *= mask;
    dark_nebula_g += BW_nebula;
    dark_nebula_g = fast::max(dark_nebula_g - 1.7999999523162841796875, 0.0) * 5.0;
    dark_nebula_g *= mask;
    float3 dark_nebula_tint = float3(0.20000000298023223876953125, 0.449999988079071044921875, 0.449999988079071044921875);
    float3 dark_nebula = (dark_nebula_tint * (dark_nebula_g * _93.nebulaSaturation)) + float3(0.300000011920928955078125 * (dark_nebula_g * (1.0 - _93.nebulaSaturation)));
    nebula = fast::max(nebula - dark_nebula, float3(0.0));
    nebula *= _93.nebulaBrightness;
    return nebula;
}

static inline __attribute__((always_inline))
float4 MainPS(constant EffectUniforms& _93, thread float4& gl_FragCoord)
{
    float3 nebula = generate_nebula(_93, gl_FragCoord);
    return float4(nebula, 1.0);
}

fragment main0_out main0(constant EffectUniforms& _93 [[buffer(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    out.fragColor = MainPS(_93, gl_FragCoord);
    return out;
}

