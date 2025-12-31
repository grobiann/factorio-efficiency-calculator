#version 330

const int _94[9] = int[](0, 1, 2, 7, 8, 3, 6, 5, 4);

layout(std140) uniform territoryOverlayUniforms
{
    mat4 projection;
    vec4 stripeColor;
    vec4 softBorderColor;
    vec4 solidBorderColor;
    float stripeWidth;
    float softBorderWidth;
    float solidBorderWidth;
    float stripeShift;
} _228;

flat in uint chunkData;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;

uint choose(uint choice, uint option0, uint option1)
{
    return ((1u - choice) * option0) + (choice * option1);
}

float circular_clamp(float value, uint cap)
{
    float s = sign(value);
    uint is_negative = uint(trunc((-s) + 0.5));
    float floored = floor(value);
    uint clamped = ((uint(abs(floored)) % cap) + cap) % cap;
    uint param = is_negative;
    uint param_1 = (cap - clamped) % cap;
    uint param_2 = clamped;
    uint adjusted = choose(param, param_1, param_2);
    return value - (floored - float(adjusted));
}

float isBetween(float x, float min_, float max_)
{
    return step(min_, x) * (1.0 - step(max_, x));
}

vec4 choose(uint choice, vec4 option0, vec4 option1)
{
    return (option0 * float(1u - choice)) + (option1 * float(choice));
}

uint isWithinBorder(vec2 uv, float borderWidth)
{
    uint col = uint(step(borderWidth, uv.x) + step(1.0 - borderWidth, uv.x));
    uint row = uint(step(borderWidth, uv.y) + step(1.0 - borderWidth, uv.y));
    uint sector = clamp((row * 3u) + col, 0u, 8u);
    return ((chunkData & 255u) >> uint(_94[sector])) & 1u;
}

void main()
{
    vec4 color = vec4(0.0);
    uint isInTerritory = (chunkData >> uint(8)) & 1u;
    float param = vUV.x;
    uint param_1 = 1u;
    float param_2 = vUV.y;
    uint param_3 = 1u;
    vec2 uv1 = vec2(circular_clamp(param, param_1), circular_clamp(param_2, param_3));
    float param_4 = vUV.x;
    uint param_5 = 2u;
    float param_6 = vUV.y;
    uint param_7 = 2u;
    vec2 uv2 = vec2(circular_clamp(param_4, param_5), circular_clamp(param_6, param_7));
    float cellVariantShift = float((chunkData >> uint(9)) & 1u) * 1.0;
    float param_8 = (uv2.y + _228.stripeShift) + cellVariantShift;
    uint param_9 = 2u;
    float stripeX = circular_clamp(param_8, param_9);
    float stripeXMin = stripeX - (_228.stripeWidth / 2.0);
    float stripeXMax = stripeX + (_228.stripeWidth / 2.0);
    float param_10 = uv2.x;
    float param_11 = stripeXMin;
    float param_12 = stripeXMax;
    float param_13 = uv2.x + 2.0;
    float param_14 = stripeXMin;
    float param_15 = stripeXMax;
    float param_16 = uv2.x - 2.0;
    float param_17 = stripeXMin;
    float param_18 = stripeXMax;
    uint stripeC = isInTerritory * uint(trunc(clamp((isBetween(param_10, param_11, param_12) + isBetween(param_13, param_14, param_15)) + isBetween(param_16, param_17, param_18), 0.0, 1.0)));
    uint param_19 = stripeC;
    vec4 param_20 = color;
    vec4 param_21 = _228.stripeColor;
    color = choose(param_19, param_20, param_21);
    vec2 param_22 = uv1;
    float param_23 = _228.softBorderWidth;
    uint softBorderC = isInTerritory * isWithinBorder(param_22, param_23);
    uint param_24 = softBorderC;
    vec4 param_25 = color;
    vec4 param_26 = _228.softBorderColor;
    color = choose(param_24, param_25, param_26);
    vec2 param_27 = uv1;
    float param_28 = _228.solidBorderWidth;
    uint solidBorderC = isWithinBorder(param_27, param_28);
    uint param_29 = solidBorderC;
    vec4 param_30 = color;
    vec4 param_31 = _228.solidBorderColor;
    color = choose(param_29, param_30, param_31);
    fragColor = color;
}

