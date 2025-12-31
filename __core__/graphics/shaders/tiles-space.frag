#version 330

layout(std140) uniform EffectUniforms
{
    vec2 resolution;
    vec2 backgroundOffset;
    vec2 padding_0;
    float time;
    float zoom;
    float nebulaScale;
    float scrollFactor;
    float nebulaBrightness;
    float nebulaSaturation;
    vec2 backgroundOffsetScaled;
    float unscaleFactor;
    float padding_01;
    int debugOption;
    float padding_02;
    vec2 padding_03;
} _93;

layout(location = 0) out vec4 fragColor;

float random(vec2 st)
{
    float s = dot(st, vec2(12.345600128173828125, 34.141498565673828125));
    return fract(sin(s) * 45678.8984375);
}

float perlinNoise(vec2 st)
{
    vec2 cell = floor(st);
    vec2 cell2 = ceil(st);
    vec2 f = fract(st);
    vec2 param = cell;
    float s00 = random(param);
    vec2 param_1 = vec2(cell.x, cell2.y);
    float s01 = random(param_1);
    vec2 param_2 = vec2(cell2.x, cell.y);
    float s10 = random(param_2);
    vec2 param_3 = cell2;
    float s11 = random(param_3);
    return mix(mix(s00, s10, f.x), mix(s01, s11, f.x), f.y);
}

vec3 generate_nebula()
{
    vec2 uv = _93.backgroundOffsetScaled + ((gl_FragCoord.xy - (_93.resolution * 0.5)) * _93.unscaleFactor);
    vec3 nebula = vec3(0.0);
    vec2 nebulaUV = uv * _93.nebulaScale;
    float nebula_mask_sum = 0.0;
    float dark_nebula_g = 0.0;
    for (int i = 1; i <= 7; i++)
    {
        float iscale = float(1 << i);
        vec2 param = nebulaUV * iscale;
        vec2 param_1 = (nebulaUV * 5.0) + vec2(76.43399810791015625);
        param.x += (perlinNoise(param_1) * 0.20000000298023223876953125);
        vec2 param_2 = (nebulaUV * 5.0) + vec2(91.2570037841796875);
        param.y += (perlinNoise(param_2) * 0.20000000298023223876953125);
        float angle = 0.4000000059604644775390625;
        param.x = (param.x * cos(angle)) - (param.y * sin(angle));
        param.y = (param.x * sin(angle)) + (param.y * cos(angle));
        float influence = 1.0 / pow(float(i), 2.0);
        vec2 param_3 = param + vec2(23.6529998779296875);
        nebula.x += (perlinNoise(param_3) * influence);
        vec2 param_4 = param + vec2(12.34500026702880859375);
        nebula.y += (perlinNoise(param_4) * influence);
        vec2 param_5 = param + vec2(34.14099884033203125);
        nebula.z += (perlinNoise(param_5) * influence);
        vec2 param_6 = (param / vec2(2.0)) + vec2(36.673999786376953125);
        vec2 param_7 = (param / vec2(2.0)) + vec2(46.325000762939453125);
        vec2 param_8 = (param / vec2(2.0)) + vec2(75.2350006103515625);
        nebula_mask_sum += (((perlinNoise(param_6) * influence) + (perlinNoise(param_7) * influence)) + (perlinNoise(param_8) * influence));
        vec2 param_9 = (param * 2.0) + vec2(23.6529998779296875);
        dark_nebula_g += (perlinNoise(param_9) * influence);
    }
    float mask = nebula_mask_sum / 3.0;
    mask = max((0.449999988079071044921875 * mask) - 0.300000011920928955078125, 0.0);
    float BW_nebula = ((nebula.x + nebula.y) + nebula.z) / 3.0;
    nebula = (nebula * _93.nebulaSaturation) + vec3(BW_nebula * (1.0 - _93.nebulaSaturation));
    nebula *= mask;
    dark_nebula_g += BW_nebula;
    dark_nebula_g = max(dark_nebula_g - 1.7999999523162841796875, 0.0) * 5.0;
    dark_nebula_g *= mask;
    vec3 dark_nebula_tint = vec3(0.20000000298023223876953125, 0.449999988079071044921875, 0.449999988079071044921875);
    vec3 dark_nebula = (dark_nebula_tint * (dark_nebula_g * _93.nebulaSaturation)) + vec3(0.300000011920928955078125 * (dark_nebula_g * (1.0 - _93.nebulaSaturation)));
    nebula = max(nebula - dark_nebula, vec3(0.0));
    nebula *= _93.nebulaBrightness;
    return nebula;
}

vec4 MainPS()
{
    vec3 nebula = generate_nebula();
    return vec4(nebula, 1.0);
}

void main()
{
    fragColor = MainPS();
}

