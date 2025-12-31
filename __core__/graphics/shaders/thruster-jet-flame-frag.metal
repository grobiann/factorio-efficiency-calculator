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

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    uint vQuality [[user(locn1)]];
    float vTime [[user(locn2), flat]];
    float2 vEffectSize [[user(locn3), flat]];
    float vThrustRatio [[user(locn4), flat]];
    float vFuelRatio [[user(locn5), flat]];
    float vOxidizerRatio [[user(locn6), flat]];
    float vRandomSeed [[user(locn7), flat]];
};

static inline __attribute__((always_inline))
float choke(thread float& _coverage, thread const float& _speed, thread float& vTime, thread float& vRandomSeed)
{
    _coverage *= 0.699999988079071044921875;
    _coverage = powr(_coverage, 0.75);
    float x = (vTime + (vRandomSeed * 100.0)) * _speed;
    float rise = powr(fract(1.0 - x), 2.0);
    float _noise = fract(sin(floor(x)) * 10000.0);
    _noise *= 0.5;
    _noise += 0.5;
    _noise = mix(0.0, _noise, rise);
    float sstep = step(fract(sin(floor(x + 10.0)) * 10000.0), _coverage);
    _noise *= sstep;
    return 1.0 - _noise;
}

static inline __attribute__((always_inline))
float2 realityLoop(thread float2& _uv, thread const float& _modulo)
{
    _uv.x = mix(mod(_uv.x, _modulo), mod(_modulo - _uv.x, _modulo), step(_modulo, mod(_uv.x, _modulo * 2.0)));
    _uv.y = mix(mod(_uv.y, _modulo), mod(_modulo - _uv.y, _modulo), step(_modulo, mod(_uv.y, _modulo * 2.0)));
    return _uv;
}

static inline __attribute__((always_inline))
float2 hash(thread float2& p)
{
    p = float2(dot(p, float2(127.09999847412109375, 311.70001220703125)), dot(p, float2(269.5, 183.3000030517578125)));
    return float2(-1.0) + (fract(sin(p) * 43758.546875) * 2.0);
}

static inline __attribute__((always_inline))
float _noise(thread const float2& p)
{
    float2 i = floor(p + float2((p.x + p.y) * 0.3660254180431365966796875));
    float2 a = (p - i) + float2((i.x + i.y) * 0.211324870586395263671875);
    float m = step(a.y, a.x);
    float2 o = float2(m, 1.0 - m);
    float2 b = (a - o) + float2(0.211324870586395263671875);
    float2 c = (a - float2(1.0)) + float2(0.42264974117279052734375);
    float3 h = fast::max(float3(0.5) - float3(dot(a, a), dot(b, b), dot(c, c)), float3(0.0));
    float2 param = i + float2(0.0);
    float2 _322 = hash(param);
    float2 param_1 = i + o;
    float2 _329 = hash(param_1);
    float2 param_2 = i + float2(1.0);
    float2 _336 = hash(param_2);
    float3 n = (((h * h) * h) * h) * float3(dot(a, _322), dot(b, _329), dot(c, _336));
    return dot(n, float3(70.0));
}

static inline __attribute__((always_inline))
float simplex2(thread float2& _uv, thread const float& _speed, thread float& vTime, thread float& vRandomSeed)
{
    _uv.y -= (100.0 * vRandomSeed);
    _uv.x += (100.0 * vRandomSeed);
    _uv.y *= 4.0;
    float modulo = 100.0;
    float constipatedTime = mod(vTime, modulo * 2.0);
    _uv.y -= (_speed * constipatedTime);
    float2x2 m = float2x2(float2(2.0, 1.0), float2(-1.0, 2.0));
    float2 param = _uv;
    float param_1 = modulo;
    float2 _387 = realityLoop(param, param_1);
    float2 param_2 = _387;
    float f = _noise(param_2);
    _uv = m * _uv;
    _uv.y -= constipatedTime;
    _uv.x += constipatedTime;
    float2 param_3 = _uv;
    float param_4 = modulo;
    float2 _407 = realityLoop(param_3, param_4);
    float2 param_5 = _407;
    f += (0.5 * _noise(param_5));
    _uv = m * _uv;
    _uv.y += constipatedTime;
    _uv.x -= constipatedTime;
    float2 param_6 = _uv;
    float param_7 = modulo;
    float2 _431 = realityLoop(param_6, param_7);
    float2 param_8 = _431;
    f += (0.25 * _noise(param_8));
    _uv = m * _uv;
    _uv.y -= constipatedTime;
    _uv.x += constipatedTime;
    float2 param_9 = _uv;
    float param_10 = modulo;
    float2 _455 = realityLoop(param_9, param_10);
    float2 param_11 = _455;
    f += (0.125 * _noise(param_11));
    return f;
}

static inline __attribute__((always_inline))
float trdrp(thread const float& _n, thread float& _x)
{
    _x -= 0.5;
    _x *= 2.0;
    return sin(acos(_x)) * powr(sin(acos(_x) / 2.0), _n);
}

static inline __attribute__((always_inline))
float crclDepth(thread const float& _X, thread const float& _r)
{
    float depth = sqrt(fast::clamp(powr(_r, 2.0) - powr(_X, 2.0), 0.0, 1.0));
    return depth;
}

static inline __attribute__((always_inline))
float crclDensity(thread const float& _X, thread const float& _r, thread const float& _b)
{
    float param = _X;
    float param_1 = _r;
    float depth = crclDepth(param, param_1);
    float dens = _b / (powr(_r, 1.5) * 3.1400001049041748046875);
    return depth * dens;
}

static inline __attribute__((always_inline))
float crclBorder(thread const float& _X, thread const float& _r, thread const float& _fac)
{
    float res = abs((0.89999997615814208984375 * _r) - abs(_X));
    return powr(1.0 - res, _fac);
}

static inline __attribute__((always_inline))
float sparksNoise(thread float2& _uv, thread const float& _s, thread float& vTime, thread float& vRandomSeed)
{
    _uv.y -= (100.0 * vRandomSeed);
    _uv.x += (100.0 * vRandomSeed);
    float modulo = 100.0;
    float constipatedTime = mod(vTime, modulo * 2.0);
    _uv.y -= (_s * constipatedTime);
    float2 param = _uv;
    float param_1 = modulo;
    float2 _542 = realityLoop(param, param_1);
    float2 param_2 = _542;
    return _noise(param_2);
}

static inline __attribute__((always_inline))
float starSimplex(thread float2& _uv, thread const float& _speed, thread float& vTime, thread float& vRandomSeed)
{
    _uv.y -= (100.0 * vRandomSeed);
    _uv.x += (100.0 * vRandomSeed);
    _uv.y *= 2.0;
    _uv.x *= 10.0;
    float modulo = 100.0;
    float constipatedTime = mod(vTime, modulo * 2.0);
    _uv.y -= ((_speed * constipatedTime) * 2.0);
    float2 param = _uv;
    float param_1 = modulo;
    float2 _503 = realityLoop(param, param_1);
    float2 param_2 = _503;
    float f = _noise(param_2);
    f = smoothstep(0.4000000059604644775390625, 0.800000011920928955078125, f);
    return f;
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]])
{
    main0_out out = {};
    float4 color = tex.sample(texSmplr, in.vUV);
    float2 pixelatedUV = floor(in.vUV * in.vEffectSize) / in.vEffectSize;
    float2 st = pixelatedUV;
    st.x = (st.x - 0.5) * 2.0;
    float rY = 1.0 - st.y;
    float time = in.vTime + in.vRandomSeed;
    time *= ((in.vRandomSeed * 0.300000011920928955078125) + 0.699999988079071044921875);
    float loop = (sin(time) * 0.5) + 0.5;
    float Q = float(in.vQuality) / 4.0;
    float THR = ((in.vThrustRatio * 0.699999988079071044921875) + mix(0.100000001490116119384765625, 0.4000000059604644775390625, loop)) - 0.100000001490116119384765625;
    float fuel = fast::clamp((in.vFuelRatio - 0.100000001490116119384765625) * 1.65999996662139892578125, 0.0, 1.0);
    float oxyd = fast::clamp((in.vOxidizerRatio - 0.100000001490116119384765625) * 1.65999996662139892578125, 0.0, 1.0);
    float param = 1.0 - in.vThrustRatio;
    float param_1 = 1.0;
    float _626 = choke(param, param_1, in.vTime, in.vRandomSeed);
    float choking = _626;
    float2 param_2 = st * 2.0;
    float param_3 = 3.0;
    float _633 = simplex2(param_2, param_3, in.vTime, in.vRandomSeed);
    float maskSimplex1 = _633;
    float2 param_4 = float2(st.x, st.y * 0.5);
    float param_5 = 1.2000000476837158203125;
    float _644 = simplex2(param_4, param_5, in.vTime, in.vRandomSeed);
    float maskSimplex2 = _644;
    float maskSimplex = maskSimplex1 + maskSimplex2;
    maskSimplex *= 0.25;
    maskSimplex += mix(0.4000000059604644775390625, 0.800000011920928955078125, fuel);
    maskSimplex = fast::max(maskSimplex, 0.75 * rY);
    float2 param_6 = st * 3.0;
    float param_7 = 8.0;
    float _665 = simplex2(param_6, param_7, in.vTime, in.vRandomSeed);
    float warp = sin(_665);
    st.x += (mix(0.0500000007450580596923828125, 0.75, powr(st.y, 2.0)) * warp);
    st.x += (sin(maskSimplex2 - maskSimplex1) * mix(0.100000001490116119384765625, 0.0, fuel));
    float2 innerUV = st + float2(0.0500000007450580596923828125 * warp);
    float2 size = float2(1.0);
    size.x = mix(0.20000000298023223876953125, 0.75, THR) + (Q * 0.100000001490116119384765625);
    size.y = mix(0.0500000007450580596923828125, 0.4000000059604644775390625, THR) + (Q * 0.0500000007450580596923828125);
    size *= mix(0.75, 1.0, fuel);
    float n = mix(1.0, 4.0, THR);
    float param_8 = n;
    float param_9 = innerUV.y / size.y;
    float _731 = trdrp(param_8, param_9);
    float param_10 = innerUV.x / size.x;
    float param_11 = _731;
    float maskFl = crclDepth(param_10, param_11);
    maskFl *= (smoothstep(0.0, 1.2000000476837158203125, maskFl) * 4.0);
    size.x = 0.800000011920928955078125 + (THR * 0.20000000298023223876953125);
    size.x *= mix(0.75, 1.0, fuel);
    size.y = mix(2.0, 1.0, THR);
    float sin_size = mix(40.0, 60.0, loop);
    float sin_freq = mix(20.0, 30.0, loop);
    float expand = mix(3.0, 1.0, THR);
    float exp_base = mix(0.5, 0.60000002384185791015625, THR);
    float exp_mult = mix(0.4000000059604644775390625, 0.60000002384185791015625, loop);
    float shaperSin = 0.60000002384185791015625 + (((2.0 + ((6.0 * st.y) * size.y)) * sin(((st.y * size.y) / ((st.y * size.y) + 1.0)) * sin_freq)) / sin_size);
    float shaperExpand = exp_base + (exp_mult * powr(st.y * size.y, expand));
    float sin_start = 0.4000000059604644775390625;
    float exp_max = 0.800000011920928955078125;
    float shaperMix = smoothstep(sin_start, exp_max, st.y);
    shaperMix = mix(1.0, shaperMix, oxyd);
    float shaperFin = mix(shaperSin, shaperExpand, shaperMix);
    float param_12 = st.x / size.x;
    float param_13 = shaperFin;
    float param_14 = powr(rY, 0.5);
    float maskIn = crclDensity(param_12, param_13, param_14);
    float param_15 = st.x / size.x;
    float param_16 = shaperFin;
    float param_17 = mix(0.3499999940395355224609375, 1.0, oxyd) * mix(0.0, 25.0, rY);
    float maskBr = crclBorder(param_15, param_16, param_17);
    float cutOffRange = (0.800000011920928955078125 - (fuel * 0.300000011920928955078125)) - mix(0.0, 0.20000000298023223876953125, loop);
    cutOffRange += ((1.0 - THR) * 0.5);
    cutOffRange += (0.4000000059604644775390625 * abs(st.x));
    cutOffRange *= sign(cutOffRange);
    maskIn *= (smoothstep(0.0, 0.125, st.y) * smoothstep(0.0, cutOffRange, rY));
    maskBr *= (smoothstep(0.0, 0.125, st.y) * smoothstep(0.0, cutOffRange, rY));
    float2 sparkUV = pixelatedUV;
    sparkUV.x -= 0.5;
    sparkUV.x *= 30.0;
    sparkUV.y *= 15.0;
    sparkUV.x *= mix(1.0, 0.25, pixelatedUV.y);
    float sparksRange = mix(0.800000011920928955078125, 0.999000012874603271484375, 1.0 - THR);
    float sparkSpeed = 12.0;
    float param_18 = st.x / size.x;
    float param_19 = shaperFin + 0.1500000059604644775390625;
    float param_20 = powr(rY, 0.5);
    float maskSp = 4.0 * crclDensity(param_18, param_19, param_20);
    maskSp *= (smoothstep(0.0, 0.100000001490116119384765625, st.y) * smoothstep(0.0, cutOffRange * 0.75, rY));
    float2 param_21 = sparkUV;
    float param_22 = sparkSpeed;
    float _960 = sparksNoise(param_21, param_22, in.vTime, in.vRandomSeed);
    float noiseSparks = _960;
    float maskSparks = 1.0 - step(noiseSparks, sparksRange);
    maskSparks += (0.75 * smoothstep(sparksRange * 0.75, 1.0, noiseSparks));
    maskSparks += (0.5 * smoothstep(sparksRange * 0.5, 1.0, noiseSparks));
    maskSparks *= fast::clamp(maskSp, 0.0, 1.0);
    maskSparks *= (1.0 - maskFl);
    float colMix = mix(2.0, 1.0, THR);
    float oxyd_sharp = mix(10.0, 5.0, oxyd) - Q;
    float oxyd_offset = mix(0.0, 0.5, oxyd) + (Q * 0.100000001490116119384765625);
    float oxyd_piramid = (abs(st.x) * 0.60000002384185791015625) + 0.4000000059604644775390625;
    float colOxyd = (st.y * oxyd_sharp) - oxyd_offset;
    colOxyd += (0.20000000298023223876953125 * warp);
    colOxyd *= oxyd_piramid;
    colOxyd = mix(1.0, colOxyd, smoothstep(0.0, 0.20000000298023223876953125, in.vOxidizerRatio));
    float2 dUV = pixelatedUV + float2(0.032999999821186065673828125 * warp);
    dUV.x -= 0.5;
    dUV.x *= (rY * 2.0);
    float2 param_23 = dUV;
    float param_24 = 3.0;
    float _1048 = starSimplex(param_23, param_24, in.vTime, in.vRandomSeed);
    float dirt = _1048;
    dirt = smoothstep(0.60000002384185791015625, 1.0, dirt);
    dirt *= maskIn;
    dirt = mix(dirt * 2.0, (dirt * maskSimplex1) + (dirt * maskSimplex2), fuel);
    float4 colorDirt = tex.sample(texSmplr, float2(powr(dirt, colMix), 1.0));
    float4 colorIn = tex.sample(texSmplr, float2(powr(maskIn, colMix), colOxyd));
    colorIn *= (float4(maskIn) * mix(2.0, 3.0, THR));
    colorIn *= mix(1.0, 1.2000000476837158203125, Q);
    colorIn += (colorDirt * rY);
    float4 colorBr = tex.sample(texSmplr, float2(powr(maskBr, colMix), colOxyd));
    colorBr *= ((float4(maskBr) * (2.0 + Q)) * mix(0.5, 1.0, THR));
    colorBr *= mix(1.0, 1.2000000476837158203125, Q);
    color = colorIn + (colorBr * powr(rY, 4.0));
    color *= float4(maskSimplex);
    float4 colorFl = tex.sample(texSmplr, float2(powr(maskFl, 2.400000095367431640625), 1.0));
    colorFl *= ((float4(maskFl) * mix(0.5, 2.0, (THR + fuel) * 0.5)) * choking);
    color *= (((1.0 - powr(maskSimplex2, 2.0)) * 0.5) + 0.5);
    float4 colorSp = tex.sample(texSmplr, float2(powr(maskSparks, 2.400000095367431640625), 1.0));
    colorSp *= float4(maskSparks);
    color += (colorSp * 0.75);
    color = mix(color, colorFl, float4(powr(maskFl, 0.75)));
    color.w = 0.0;
    out.fragColor = color;
    out.lightColor = float4(color.xyz, 0.0);
    return out;
}

