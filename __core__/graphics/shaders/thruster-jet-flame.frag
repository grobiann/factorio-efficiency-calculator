#version 330

uniform sampler2D tex;

flat in float vTime;
flat in float vRandomSeed;
in vec2 vUV;
flat in vec2 vEffectSize;
flat in uint vQuality;
flat in float vThrustRatio;
flat in float vFuelRatio;
flat in float vOxidizerRatio;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;

float choke(inout float _coverage, float _speed)
{
    _coverage *= 0.699999988079071044921875;
    _coverage = pow(_coverage, 0.75);
    float x = (vTime + (vRandomSeed * 100.0)) * _speed;
    float rise = pow(fract(1.0 - x), 2.0);
    float _noise = fract(sin(floor(x)) * 10000.0);
    _noise *= 0.5;
    _noise += 0.5;
    _noise = mix(0.0, _noise, rise);
    float sstep = step(fract(sin(floor(x + 10.0)) * 10000.0), _coverage);
    _noise *= sstep;
    return 1.0 - _noise;
}

vec2 realityLoop(inout vec2 _uv, float _modulo)
{
    _uv.x = mix(mod(_uv.x, _modulo), mod(_modulo - _uv.x, _modulo), step(_modulo, mod(_uv.x, _modulo * 2.0)));
    _uv.y = mix(mod(_uv.y, _modulo), mod(_modulo - _uv.y, _modulo), step(_modulo, mod(_uv.y, _modulo * 2.0)));
    return _uv;
}

vec2 hash(inout vec2 p)
{
    p = vec2(dot(p, vec2(127.09999847412109375, 311.70001220703125)), dot(p, vec2(269.5, 183.3000030517578125)));
    return vec2(-1.0) + (fract(sin(p) * 43758.546875) * 2.0);
}

float _noise(vec2 p)
{
    vec2 i = floor(p + vec2((p.x + p.y) * 0.3660254180431365966796875));
    vec2 a = (p - i) + vec2((i.x + i.y) * 0.211324870586395263671875);
    float m = step(a.y, a.x);
    vec2 o = vec2(m, 1.0 - m);
    vec2 b = (a - o) + vec2(0.211324870586395263671875);
    vec2 c = (a - vec2(1.0)) + vec2(0.42264974117279052734375);
    vec3 h = max(vec3(0.5) - vec3(dot(a, a), dot(b, b), dot(c, c)), vec3(0.0));
    vec2 param = i + vec2(0.0);
    vec2 _322 = hash(param);
    vec2 param_1 = i + o;
    vec2 _329 = hash(param_1);
    vec2 param_2 = i + vec2(1.0);
    vec2 _336 = hash(param_2);
    vec3 n = (((h * h) * h) * h) * vec3(dot(a, _322), dot(b, _329), dot(c, _336));
    return dot(n, vec3(70.0));
}

float simplex2(inout vec2 _uv, float _speed)
{
    _uv.y -= (100.0 * vRandomSeed);
    _uv.x += (100.0 * vRandomSeed);
    _uv.y *= 4.0;
    float modulo = 100.0;
    float constipatedTime = mod(vTime, modulo * 2.0);
    _uv.y -= (_speed * constipatedTime);
    mat2 m = mat2(vec2(2.0, 1.0), vec2(-1.0, 2.0));
    vec2 param = _uv;
    float param_1 = modulo;
    vec2 _387 = realityLoop(param, param_1);
    vec2 param_2 = _387;
    float f = _noise(param_2);
    _uv = m * _uv;
    _uv.y -= constipatedTime;
    _uv.x += constipatedTime;
    vec2 param_3 = _uv;
    float param_4 = modulo;
    vec2 _407 = realityLoop(param_3, param_4);
    vec2 param_5 = _407;
    f += (0.5 * _noise(param_5));
    _uv = m * _uv;
    _uv.y += constipatedTime;
    _uv.x -= constipatedTime;
    vec2 param_6 = _uv;
    float param_7 = modulo;
    vec2 _431 = realityLoop(param_6, param_7);
    vec2 param_8 = _431;
    f += (0.25 * _noise(param_8));
    _uv = m * _uv;
    _uv.y -= constipatedTime;
    _uv.x += constipatedTime;
    vec2 param_9 = _uv;
    float param_10 = modulo;
    vec2 _455 = realityLoop(param_9, param_10);
    vec2 param_11 = _455;
    f += (0.125 * _noise(param_11));
    return f;
}

float trdrp(float _n, inout float _x)
{
    _x -= 0.5;
    _x *= 2.0;
    return sin(acos(_x)) * pow(sin(acos(_x) / 2.0), _n);
}

float crclDepth(float _X, float _r)
{
    float depth = sqrt(clamp(pow(_r, 2.0) - pow(_X, 2.0), 0.0, 1.0));
    return depth;
}

float crclDensity(float _X, float _r, float _b)
{
    float param = _X;
    float param_1 = _r;
    float depth = crclDepth(param, param_1);
    float dens = _b / (pow(_r, 1.5) * 3.1400001049041748046875);
    return depth * dens;
}

float crclBorder(float _X, float _r, float _fac)
{
    float res = abs((0.89999997615814208984375 * _r) - abs(_X));
    return pow(1.0 - res, _fac);
}

float sparksNoise(inout vec2 _uv, float _s)
{
    _uv.y -= (100.0 * vRandomSeed);
    _uv.x += (100.0 * vRandomSeed);
    float modulo = 100.0;
    float constipatedTime = mod(vTime, modulo * 2.0);
    _uv.y -= (_s * constipatedTime);
    vec2 param = _uv;
    float param_1 = modulo;
    vec2 _542 = realityLoop(param, param_1);
    vec2 param_2 = _542;
    return _noise(param_2);
}

float starSimplex(inout vec2 _uv, float _speed)
{
    _uv.y -= (100.0 * vRandomSeed);
    _uv.x += (100.0 * vRandomSeed);
    _uv.y *= 2.0;
    _uv.x *= 10.0;
    float modulo = 100.0;
    float constipatedTime = mod(vTime, modulo * 2.0);
    _uv.y -= ((_speed * constipatedTime) * 2.0);
    vec2 param = _uv;
    float param_1 = modulo;
    vec2 _503 = realityLoop(param, param_1);
    vec2 param_2 = _503;
    float f = _noise(param_2);
    f = smoothstep(0.4000000059604644775390625, 0.800000011920928955078125, f);
    return f;
}

void main()
{
    vec4 color = texture(tex, vUV);
    vec2 pixelatedUV = floor(vUV * vEffectSize) / vEffectSize;
    vec2 st = pixelatedUV;
    st.x = (st.x - 0.5) * 2.0;
    float rY = 1.0 - st.y;
    float time = vTime + vRandomSeed;
    time *= ((vRandomSeed * 0.300000011920928955078125) + 0.699999988079071044921875);
    float loop = (sin(time) * 0.5) + 0.5;
    float Q = float(vQuality) / 4.0;
    float THR = ((vThrustRatio * 0.699999988079071044921875) + mix(0.100000001490116119384765625, 0.4000000059604644775390625, loop)) - 0.100000001490116119384765625;
    float fuel = clamp((vFuelRatio - 0.100000001490116119384765625) * 1.65999996662139892578125, 0.0, 1.0);
    float oxyd = clamp((vOxidizerRatio - 0.100000001490116119384765625) * 1.65999996662139892578125, 0.0, 1.0);
    float param = 1.0 - vThrustRatio;
    float param_1 = 1.0;
    float _626 = choke(param, param_1);
    float choking = _626;
    vec2 param_2 = st * 2.0;
    float param_3 = 3.0;
    float _633 = simplex2(param_2, param_3);
    float maskSimplex1 = _633;
    vec2 param_4 = vec2(st.x, st.y * 0.5);
    float param_5 = 1.2000000476837158203125;
    float _644 = simplex2(param_4, param_5);
    float maskSimplex2 = _644;
    float maskSimplex = maskSimplex1 + maskSimplex2;
    maskSimplex *= 0.25;
    maskSimplex += mix(0.4000000059604644775390625, 0.800000011920928955078125, fuel);
    maskSimplex = max(maskSimplex, 0.75 * rY);
    vec2 param_6 = st * 3.0;
    float param_7 = 8.0;
    float _665 = simplex2(param_6, param_7);
    float warp = sin(_665);
    st.x += (mix(0.0500000007450580596923828125, 0.75, pow(st.y, 2.0)) * warp);
    st.x += (sin(maskSimplex2 - maskSimplex1) * mix(0.100000001490116119384765625, 0.0, fuel));
    vec2 innerUV = st + vec2(0.0500000007450580596923828125 * warp);
    vec2 size = vec2(1.0);
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
    float shaperExpand = exp_base + (exp_mult * pow(st.y * size.y, expand));
    float sin_start = 0.4000000059604644775390625;
    float exp_max = 0.800000011920928955078125;
    float shaperMix = smoothstep(sin_start, exp_max, st.y);
    shaperMix = mix(1.0, shaperMix, oxyd);
    float shaperFin = mix(shaperSin, shaperExpand, shaperMix);
    float param_12 = st.x / size.x;
    float param_13 = shaperFin;
    float param_14 = pow(rY, 0.5);
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
    vec2 sparkUV = pixelatedUV;
    sparkUV.x -= 0.5;
    sparkUV.x *= 30.0;
    sparkUV.y *= 15.0;
    sparkUV.x *= mix(1.0, 0.25, pixelatedUV.y);
    float sparksRange = mix(0.800000011920928955078125, 0.999000012874603271484375, 1.0 - THR);
    float sparkSpeed = 12.0;
    float param_18 = st.x / size.x;
    float param_19 = shaperFin + 0.1500000059604644775390625;
    float param_20 = pow(rY, 0.5);
    float maskSp = 4.0 * crclDensity(param_18, param_19, param_20);
    maskSp *= (smoothstep(0.0, 0.100000001490116119384765625, st.y) * smoothstep(0.0, cutOffRange * 0.75, rY));
    vec2 param_21 = sparkUV;
    float param_22 = sparkSpeed;
    float _960 = sparksNoise(param_21, param_22);
    float noiseSparks = _960;
    float maskSparks = 1.0 - step(noiseSparks, sparksRange);
    maskSparks += (0.75 * smoothstep(sparksRange * 0.75, 1.0, noiseSparks));
    maskSparks += (0.5 * smoothstep(sparksRange * 0.5, 1.0, noiseSparks));
    maskSparks *= clamp(maskSp, 0.0, 1.0);
    maskSparks *= (1.0 - maskFl);
    float colMix = mix(2.0, 1.0, THR);
    float oxyd_sharp = mix(10.0, 5.0, oxyd) - Q;
    float oxyd_offset = mix(0.0, 0.5, oxyd) + (Q * 0.100000001490116119384765625);
    float oxyd_piramid = (abs(st.x) * 0.60000002384185791015625) + 0.4000000059604644775390625;
    float colOxyd = (st.y * oxyd_sharp) - oxyd_offset;
    colOxyd += (0.20000000298023223876953125 * warp);
    colOxyd *= oxyd_piramid;
    colOxyd = mix(1.0, colOxyd, smoothstep(0.0, 0.20000000298023223876953125, vOxidizerRatio));
    vec2 dUV = pixelatedUV + vec2(0.032999999821186065673828125 * warp);
    dUV.x -= 0.5;
    dUV.x *= (rY * 2.0);
    vec2 param_23 = dUV;
    float param_24 = 3.0;
    float _1048 = starSimplex(param_23, param_24);
    float dirt = _1048;
    dirt = smoothstep(0.60000002384185791015625, 1.0, dirt);
    dirt *= maskIn;
    dirt = mix(dirt * 2.0, (dirt * maskSimplex1) + (dirt * maskSimplex2), fuel);
    vec4 colorDirt = texture(tex, vec2(pow(dirt, colMix), 1.0));
    vec4 colorIn = texture(tex, vec2(pow(maskIn, colMix), colOxyd));
    colorIn *= (vec4(maskIn) * mix(2.0, 3.0, THR));
    colorIn *= mix(1.0, 1.2000000476837158203125, Q);
    colorIn += (colorDirt * rY);
    vec4 colorBr = texture(tex, vec2(pow(maskBr, colMix), colOxyd));
    colorBr *= ((vec4(maskBr) * (2.0 + Q)) * mix(0.5, 1.0, THR));
    colorBr *= mix(1.0, 1.2000000476837158203125, Q);
    color = colorIn + (colorBr * pow(rY, 4.0));
    color *= vec4(maskSimplex);
    vec4 colorFl = texture(tex, vec2(pow(maskFl, 2.400000095367431640625), 1.0));
    colorFl *= ((vec4(maskFl) * mix(0.5, 2.0, (THR + fuel) * 0.5)) * choking);
    color *= (((1.0 - pow(maskSimplex2, 2.0)) * 0.5) + 0.5);
    vec4 colorSp = texture(tex, vec2(pow(maskSparks, 2.400000095367431640625), 1.0));
    colorSp *= vec4(maskSparks);
    color += (colorSp * 0.75);
    color = mix(color, colorFl, vec4(pow(maskFl, 0.75)));
    color.w = 0.0;
    fragColor = color;
    lightColor = vec4(color.xyz, 0.0);
}

