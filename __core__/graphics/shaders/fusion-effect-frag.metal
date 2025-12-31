#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float4 color [[user(locn1)]];
    float time [[user(locn2), flat]];
    float fusionPower [[user(locn3), flat]];
    float plasmaLevel [[user(locn4), flat]];
    float quality [[user(locn5), flat]];
    float randomSeed [[user(locn6), flat]];
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
float2 getNoise(thread const float2& coords, thread float& time, thread float& randomSeed)
{
    float2 param = float2(randomSeed + 0.2106563150882720947265625, randomSeed + 0.87850248813629150390625);
    float2 param_1 = (coords + float2(time)) + float2(random(param) * 100.0);
    float noise_x = perlinNoise(param_1);
    float2 param_2 = float2(randomSeed + 0.3071096837520599365234375, randomSeed + 0.0619773231446743011474609375);
    float2 param_3 = (coords + float2(time)) + float2(random(param_2) * 100.0);
    float noise_y = perlinNoise(param_3);
    return (float2(noise_x, noise_y) - float2(0.5)) * 2.0;
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    float plasma_power = in.fusionPower + (in.quality * 0.039999999105930328369140625);
    float bg_power = powr(in.plasmaLevel, 1.0) + (in.quality * 0.039999999105930328369140625);
    bg_power = fast::max(bg_power, plasma_power * 0.25);
    float4 background = in.color * powr(bg_power, 1.5);
    float2 texSize = float2(int2(tex.get_width(), tex.get_height()));
    float2 pixelatedUV = floor(in.vUV * texSize) / texSize;
    float2 param = pixelatedUV;
    float whiteNoise = random(param);
    float3 uv_effect_texture = tex.sample(texSmplr, pixelatedUV).xyz;
    float mask = uv_effect_texture.z;
    mask = fast::max(mask - (whiteNoise * 0.125), 0.0);
    float2 effectUV = uv_effect_texture.xy;
    effectUV.x *= 12.0;
    effectUV.x += (((in.time * 1.0) * (in.quality + 1.0)) * 2.0);
    float2 param_1 = effectUV;
    effectUV += (getNoise(param_1, in.time, in.randomSeed) * 0.20000000298023223876953125);
    float gradient = 1.0 - abs(effectUV.y - 0.5);
    background = mix(background * gradient, background, float4(plasma_power));
    background *= mask;
    float mid_gradient = (powr(gradient, 30.0 * fast::min(bg_power, 1.0)) * plasma_power) * 2.0;
    float plasma_line = (mid_gradient + ((powr(gradient, 30.0) * plasma_power) * 2.0)) * powr(mask, 0.5);
    plasma_line = mix(plasma_line, 0.0, mask * 0.5);
    float4 colored_plasma_line = mix(float4(plasma_line) * in.color, float4(plasma_line), float4(bg_power * mask));
    out.fragColor = background + colored_plasma_line;
    out.lightColor = out.fragColor;
    return out;
}

