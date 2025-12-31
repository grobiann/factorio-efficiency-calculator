#version 330

struct globalData
{
    float distortion1;
    float distortion2;
    float distortion12_2;
    float distortion3;
    float fineDistortion;
    float grayscale;
    vec2 coord;
};

struct OverlayLayer
{
    uint shapeAndBlend;
    float cutoff;
    vec2 scale;
    vec4 tint;
};

struct DistortionLayer
{
    uint shape;
    float intensity;
    vec2 scale;
};

layout(std140) uniform fsConstants
{
    vec2 spriteSize;
    float time;
    float worldScale;
    uint worldUVModulo;
    float padding0_;
    float padding1_;
    float padding2_;
} _240;

layout(std140) uniform fsDistortionConstants
{
    vec4 precomputedDistorions[512];
} _1866;

uniform sampler2D tex2;
uniform sampler2D tex;

in vec4 vTint;
in vec4 vWorld;
in vec4 vPos;
in vec2 vRawUV;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
vec4 shaderTint;
float textureUVSize;
float shaderTransparency;

vec3 getPrecalculatedDistortion(int index)
{
    return _1866.precomputedDistorions[index].xyz;
}

vec3 getPrecalculatedNoise(float coordinateY)
{
    float distortionIndexPrecise = 512.0 * (mod(coordinateY, 32.0) / 32.0);
    int distortionIndexA = int(mod(floor(distortionIndexPrecise), 512.0));
    int distortionIndexB = int(mod(ceil(distortionIndexPrecise), 512.0));
    float weightA = (1.0 - distortionIndexPrecise) + float(distortionIndexA);
    float weightB = 1.0 - weightA;
    int param = distortionIndexA;
    int param_1 = distortionIndexB;
    return (getPrecalculatedDistortion(param) * weightA) + (getPrecalculatedDistortion(param_1) * weightB);
}

float smoothFloor(float a, float tightness)
{
    return (a - 0.5) - (atan(((-tightness) * sin(6.28318023681640625 * a)) / (1.0 - (tightness * cos(6.28318023681640625 * a)))) / 3.141590118408203125);
}

float smoothFloorPeriodic(float a, float period, float tightness)
{
    float param = a / period;
    float param_1 = tightness;
    return period * smoothFloor(param, param_1);
}

vec2 simplexProjectTiled(vec2 coord_xy)
{
    return coord_xy + vec2(0.5 * coord_xy.y, 0.0);
}

vec2 simplexUnprojectTiled(vec2 coord_uv)
{
    return coord_uv - vec2(0.5 * coord_uv.y, 0.0);
}

vec3 permute(vec3 x0, vec3 p)
{
    vec3 x1 = mod(x0 * p.y, vec3(p.x));
    return floor(mod((x1 + vec3(p.z)) * x0, vec3(p.x)));
}

float taylorInvSqrt(float r)
{
    return 1.43427431583404541015625 - (0.8537347316741943359375 * r);
}

float simplexNoise2Tiled(vec2 v, float period)
{
    vec2 param = v;
    vec2 i = floor(simplexProjectTiled(param));
    vec2 param_1 = i;
    vec2 x0 = v - simplexUnprojectTiled(param_1);
    bvec2 _378 = bvec2(x0.x > x0.y);
    vec2 i1 = vec2(_378.x ? vec2(1.0, 0.0).x : vec2(0.0, 1.0).x, _378.y ? vec2(1.0, 0.0).y : vec2(0.0, 1.0).y);
    vec2 param_2 = i1;
    vec2 x1 = x0 - simplexUnprojectTiled(param_2);
    vec2 param_3 = vec2(1.0);
    vec2 x2 = x0 - simplexUnprojectTiled(param_3);
    vec2 i_0 = i;
    vec2 i_1 = i + i1;
    vec2 i_2 = i + vec2(1.0);
    vec3 ix = vec3(i_0.x, i_1.x, i_2.x);
    vec3 iy = vec3(i_0.y, i_1.y, i_2.y);
    ix -= ((vec3(0.5) * iy) * floor(iy / vec3(period)));
    ix = mod(ix, vec3(period));
    iy = mod(iy, vec3(period));
    vec3 param_4 = iy;
    vec3 param_5 = vec3(289.0, 34.0, 1.0);
    vec3 param_6 = permute(param_4, param_5) + ix;
    vec3 param_7 = vec3(289.0, 34.0, 1.0);
    vec3 p = permute(param_6, param_7);
    vec3 x = fract(p / vec3(7.0));
    vec3 h = vec3(0.5) - abs(x);
    vec3 sx = (vec3(lessThan(x, vec3(0.0))) * 2.0) - vec3(1.0);
    vec3 sh = vec3(lessThan(h, vec3(0.0)));
    vec3 a0 = x + (sx * sh);
    vec2 p0 = vec2(a0.x, h.x);
    vec2 p1 = vec2(a0.y, h.y);
    vec2 p2 = vec2(a0.z, h.z);
    float param_8 = dot(p0, p0);
    p0 *= taylorInvSqrt(param_8);
    float param_9 = dot(p1, p1);
    p1 *= taylorInvSqrt(param_9);
    float param_10 = dot(p2, p2);
    p2 *= taylorInvSqrt(param_10);
    vec3 g = vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2));
    vec3 m = max(vec3(0.800000011920928955078125) - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), vec3(0.0));
    m *= m;
    return 0.5 + (10.0 * dot(m * m, g));
}

vec2 distortionScanlines(vec2 scale, globalData globals)
{
    float param = _240.time;
    float param_1 = 15.0;
    float param_2 = 0.0500000007450580596923828125;
    float param_3 = 0.5 * globals.coord.y;
    float param_4 = 0.0500000007450580596923828125;
    vec2 param_5 = vec2(smoothFloorPeriodic(param, param_1, param_2) / 15.0, smoothFloor(param_3, param_4));
    float param_6 = float(_240.worldUVModulo);
    float randomDirectionStripWide = (-1.0) + (2.0 * simplexNoise2Tiled(param_5, param_6));
    float shimmerAmount = 2.0 * randomDirectionStripWide;
    shimmerAmount *= (globals.distortion3 * globals.distortion12_2);
    return vec2(shimmerAmount, 0.0);
}

vec2 distortionSin(vec2 scale, globalData globals)
{
    return vec2(sin(globals.coord.y * scale.x), 0.0);
}

vec2 distortionSinMove(vec2 scale, globalData globals)
{
    return vec2(sin((globals.coord.y * scale.x) + (_240.time * scale.y)), 0.0);
}

vec2 smallRand(vec2 co)
{
    return (vec2(fract(sin(dot(co, vec2(12.98980045318603515625, 78.233001708984375))) * 43758.546875), fract(cos(dot(co.yx, vec2(8.64947032928466796875, 45.0970001220703125))) * 43758.546875)) * 2.0) - vec2(1.0);
}

vec2 distortionBubbles(vec2 scale, globalData globals)
{
    vec2 cellID = floor(globals.coord * 0.25);
    vec2 fractCoord = fract(globals.coord * 0.25);
    float dx = max(0.0, max(0.20000000298023223876953125 - fractCoord.x, fractCoord.x - 0.800000011920928955078125)) * 5.0;
    float dy = max(0.0, max(0.20000000298023223876953125 - fractCoord.y, fractCoord.y - 0.800000011920928955078125)) * 5.0;
    float rectIntensity = max(0.0, 1.0 - sqrt((dx * dx) + (dy * dy)));
    float safeRange = max(1.0, scale.y);
    vec2 center = (fractCoord * 2.0) - vec2(1.0);
    vec2 param = cellID;
    center += ((smallRand(param) * 0.5) * scale.x);
    float param_1 = length(center * 8.0);
    return vec2((((rectIntensity * pow(2.0, (-(param_1 - scale.y)) * (param_1 - scale.y))) * sign(-center.x)) * min(1.0, abs(center.x / safeRange))) / safeRange, 0.0);
}

vec2 distortionBubblesMove(inout vec2 scale, globalData globals)
{
    float interval = 20.0;
    vec2 param = floor(globals.coord * 0.25);
    vec2 notimerng = smallRand(param);
    vec2 cellID = floor(globals.coord * 0.25) + vec2(floor(_240.time + notimerng.x));
    vec2 param_1 = cellID;
    vec2 rng = smallRand(param_1);
    scale.y = interval * fract(((scale.y / interval) + fract(_240.time + notimerng.x)) - 0.100000001490116119384765625);
    vec2 fractCoord = fract(globals.coord * 0.25);
    float dx = max(0.0, max(0.20000000298023223876953125 - fractCoord.x, fractCoord.x - 0.800000011920928955078125)) * 5.0;
    float dy = max(0.0, max(0.20000000298023223876953125 - fractCoord.y, fractCoord.y - 0.800000011920928955078125)) * 5.0;
    float rectIntensity = max(0.0, 1.0 - sqrt((dx * dx) + (dy * dy)));
    float safeRange = max(1.0, scale.y);
    vec2 center = (fractCoord * 2.0) - vec2(1.0);
    center += ((rng * 0.5) * scale.x);
    float param_2 = length(center * 8.0);
    return vec2((((rectIntensity * pow(2.0, (-(param_2 - scale.y)) * (param_2 - scale.y))) * sign(-center.x)) * min(1.0, abs(center.x / safeRange))) / safeRange, 0.0);
}

vec2 distortionGlitchSquares(vec2 scale, globalData globals)
{
    vec2 fCoord = floor(globals.coord);
    float ftime = floor((sin(fCoord.x) + cos(fCoord.y)) + (_240.time * 0.20000000298023223876953125));
    vec2 param = vec2(floor(ftime + (0.5 * globals.coord.x)), floor(ftime + (0.5 * globals.coord.y)));
    float param_1 = float(_240.worldUVModulo);
    float spatialNoise = simplexNoise2Tiled(param, param_1);
    float chaosValue = floor(spatialNoise * 2.0);
    vec2 testCoord = globals.coord + vec2(chaosValue, 0.0);
    vec2 floored = floor((testCoord * scale) - (floor((testCoord * 0.5) * scale) * 2.0));
    bool _1765 = (floored.x - floored.y) < (-0.100000001490116119384765625);
    bool _1775;
    if (!_1765)
    {
        _1775 = (floored.x - floored.y) > 0.100000001490116119384765625;
    }
    else
    {
        _1775 = _1765;
    }
    bool intensity = _1775;
    vec2 _1780;
    if (intensity && (spatialNoise > 0.5))
    {
        vec2 param_2 = vec2((100.0 * _240.time) + (20.0 * globals.coord.x), (100.0 * _240.time) + (20.0 * globals.coord.y));
        float param_3 = float(_240.worldUVModulo);
        _1780 = vec2(1.0 - (2.0 * simplexNoise2Tiled(param_2, param_3)), 0.0);
    }
    else
    {
        _1780 = vec2(0.0);
    }
    return _1780;
}

vec2 getDistortion(uint type, vec2 scale, globalData globals)
{
    switch (int(type))
    {
        case 1:
        {
            vec2 param = scale;
            globalData param_1 = globals;
            return distortionScanlines(param, param_1);
        }
        case 2:
        {
            vec2 param_2 = scale;
            globalData param_3 = globals;
            return distortionSin(param_2, param_3);
        }
        case 3:
        {
            vec2 param_4 = scale;
            globalData param_5 = globals;
            return distortionSinMove(param_4, param_5);
        }
        case 4:
        {
            vec2 param_6 = scale;
            globalData param_7 = globals;
            return distortionBubbles(param_6, param_7);
        }
        case 5:
        {
            vec2 param_8 = scale;
            globalData param_9 = globals;
            vec2 _1852 = distortionBubblesMove(param_8, param_9);
            return _1852;
        }
        case 6:
        {
            vec2 param_10 = scale;
            globalData param_11 = globals;
            return distortionGlitchSquares(param_10, param_11);
        }
        default:
        {
            return vec2(0.0);
        }
    }
}

vec4 YCoCgToRGB(vec4 ycocg, float alpha)
{
    float Y = ycocg.w;
    float scale = 1.0 / ((31.875 * ycocg.z) + 1.0);
    float Co = (ycocg.x - 0.501960813999176025390625) * scale;
    float Cg = (ycocg.y - 0.501960813999176025390625) * scale;
    float R = (Y + Co) - Cg;
    float G = Y + Cg;
    float B = (Y - Co) - Cg;
    return vec4(R, G, B, alpha);
}

vec3 screen(vec3 a, vec3 b)
{
    return vec3(1.0) - ((vec3(1.0) - a) * (vec3(1.0) - b));
}

vec3 multiply(vec3 a, vec3 b)
{
    return a * b;
}

float overlay(float a, float b)
{
    float _611;
    if (a < 0.5)
    {
        _611 = (2.0 * a) * b;
    }
    else
    {
        _611 = 1.0 - ((2.0 * (1.0 - a)) * (1.0 - b));
    }
    return _611;
}

vec3 overlay(vec3 a, vec3 b)
{
    float param = a.x;
    float param_1 = b.x;
    float param_2 = a.y;
    float param_3 = b.y;
    float param_4 = a.z;
    float param_5 = b.z;
    return vec3(overlay(param, param_1), overlay(param_2, param_3), overlay(param_4, param_5));
}

vec3 hardLight(vec3 a, vec3 b)
{
    float param = b.x;
    float param_1 = a.x;
    float param_2 = b.y;
    float param_3 = a.y;
    float param_4 = b.z;
    float param_5 = a.z;
    return vec3(overlay(param, param_1), overlay(param_2, param_3), overlay(param_4, param_5));
}

float softLight(float a, float b)
{
    float _679;
    if (b < 0.5)
    {
        _679 = ((2.0 * a) * b) + ((a * a) * (1.0 - (2.0 * b)));
    }
    else
    {
        _679 = ((2.0 * a) * (1.0 - b)) + (sqrt(a) * ((2.0 * b) - 1.0));
    }
    return _679;
}

vec3 softLight(vec3 a, vec3 b)
{
    float param = a.x;
    float param_1 = b.x;
    float param_2 = a.y;
    float param_3 = b.y;
    float param_4 = a.z;
    float param_5 = b.z;
    return vec3(softLight(param, param_1), softLight(param_2, param_3), softLight(param_4, param_5));
}

vec3 colorDodge(vec3 a, vec3 b)
{
    return a / (vec3(1.0) - b);
}

vec3 add(vec3 a, vec3 b)
{
    return a + b;
}

vec3 divide(vec3 a, vec3 b)
{
    return a / b;
}

vec3 colorBurn(vec3 a, vec3 b)
{
    return vec3(1.0) - ((vec3(1.0) - a) / b);
}

vec3 subtract(vec3 a, vec3 b)
{
    return a - b;
}

float difference(float a, float b)
{
    float _768;
    if (b > a)
    {
        _768 = b - a;
    }
    else
    {
        _768 = a - b;
    }
    return _768;
}

vec3 difference(vec3 a, vec3 b)
{
    float param = a.x;
    float param_1 = b.x;
    float param_2 = a.y;
    float param_3 = b.y;
    float param_4 = a.z;
    float param_5 = b.z;
    return vec3(difference(param, param_1), difference(param_2, param_3), difference(param_4, param_5));
}

vec3 darken(vec3 a, vec3 b)
{
    return min(a, b);
}

vec3 lighten(vec3 a, vec3 b)
{
    return max(a, b);
}

vec3 applyEffect(uint type, vec3 a, vec3 b)
{
    switch (int(type))
    {
        case 1:
        {
            vec3 param = a;
            vec3 param_1 = b;
            return screen(param, param_1);
        }
        case 2:
        {
            vec3 param_2 = a;
            vec3 param_3 = b;
            return multiply(param_2, param_3);
        }
        case 3:
        {
            vec3 param_4 = a;
            vec3 param_5 = b;
            return overlay(param_4, param_5);
        }
        case 4:
        {
            vec3 param_6 = a;
            vec3 param_7 = b;
            return hardLight(param_6, param_7);
        }
        case 5:
        {
            vec3 param_8 = a;
            vec3 param_9 = b;
            return softLight(param_8, param_9);
        }
        case 6:
        {
            vec3 param_10 = a;
            vec3 param_11 = b;
            return colorDodge(param_10, param_11);
        }
        case 7:
        {
            vec3 param_12 = a;
            vec3 param_13 = b;
            return add(param_12, param_13);
        }
        case 8:
        {
            vec3 param_14 = a;
            vec3 param_15 = b;
            return divide(param_14, param_15);
        }
        case 9:
        {
            vec3 param_16 = a;
            vec3 param_17 = b;
            return colorBurn(param_16, param_17);
        }
        case 10:
        {
            vec3 param_18 = a;
            vec3 param_19 = b;
            return subtract(param_18, param_19);
        }
        case 11:
        {
            vec3 param_20 = a;
            vec3 param_21 = b;
            return difference(param_20, param_21);
        }
        case 12:
        {
            vec3 param_22 = a;
            vec3 param_23 = b;
            return darken(param_22, param_23);
        }
        case 13:
        {
            vec3 param_24 = a;
            vec3 param_25 = b;
            return lighten(param_24, param_25);
        }
        default:
        {
            return b;
        }
    }
}

uint getShapeValue(uint arg)
{
    return (arg >> uint(0)) & 65535u;
}

uint getBlendModeValue(uint arg)
{
    return (arg >> uint(16)) & 65535u;
}

float shapeGrid(vec2 scale, globalData globals)
{
    vec2 scaled = globals.coord * scale;
    float gridCoordX = ((2.0 * (0.300000011920928955078125 + scaled.x)) + (0.0199999995529651641845703125 * sin(5.0 * scaled.y))) + ((0.0199999995529651641845703125 * sin(((-11.0) * _240.time) + (50.0 * scaled.y))) * sin((10.0 * _240.time) + (60.0 * scaled.y)));
    float gridCoordY = 2.0 * (0.300000011920928955078125 + scaled.y);
    return max(pow(2.0 * ((gridCoordX - floor(gridCoordX)) - 0.5), 4.0), pow(2.0 * ((gridCoordY - floor(gridCoordY)) - 0.5), 4.0));
}

float shapeCheckerboard(vec2 scale, globalData globals)
{
    vec2 floored = floor((globals.coord * scale) - (floor((globals.coord * 0.5) * scale) * 2.0));
    return abs(floored.x - floored.y);
}

float shapeScanlines(vec2 scale, globalData globals)
{
    return abs(globals.fineDistortion);
}

float shapeHazard(vec2 scale, globalData globals)
{
    vec2 scaled = globals.coord * scale;
    return float(int(mod(scaled.x - scaled.y, 2.0) > 1.0));
}

float shapeDiagonalGrid(vec2 scale, globalData globals)
{
    vec2 scaled = globals.coord * scale;
    scaled = vec2((scaled.x * 0.707099974155426025390625) - (scaled.y * 0.707099974155426025390625), (scaled.x * 0.707099974155426025390625) + (scaled.y * 0.707099974155426025390625));
    float gridCoordX = ((2.0 * (0.300000011920928955078125 + scaled.x)) + (0.0199999995529651641845703125 * sin(5.0 * scaled.y))) + ((0.0199999995529651641845703125 * sin(((-11.0) * _240.time) + (50.0 * scaled.y))) * sin((10.0 * _240.time) + (60.0 * scaled.y)));
    float gridCoordY = 2.0 * (0.300000011920928955078125 + scaled.y);
    return max(pow(2.0 * ((gridCoordX - floor(gridCoordX)) - 0.5), 4.0), pow(2.0 * ((gridCoordY - floor(gridCoordY)) - 0.5), 4.0));
}

float shapeTriangles(vec2 scale, globalData globals)
{
    vec2 scaled = globals.coord * vec2(scale.x, scale.x);
    float w = scale.y;
    float ymod = mod(scaled.y, 2.0);
    bool _1120 = mod(scaled.x - scaled.y, 4.0) > w;
    bool _1131;
    if (_1120)
    {
        _1131 = mod(scaled.x + scaled.y, 4.0) > w;
    }
    else
    {
        _1131 = _1120;
    }
    bool _1138;
    if (_1131)
    {
        _1138 = ymod > (w / 2.0);
    }
    else
    {
        _1138 = _1131;
    }
    bool _1146;
    if (_1138)
    {
        _1146 = ymod < (2.0 - (w / 2.0));
    }
    else
    {
        _1146 = _1138;
    }
    return float(int(_1146));
}

float shapeGlitchSquares(vec2 scale, globalData globals)
{
    vec2 fCoord = floor(globals.coord);
    float ftime = floor((sin(fCoord.x) + cos(fCoord.y)) + (_240.time * 0.20000000298023223876953125));
    vec2 param = vec2(floor(ftime + (0.5 * globals.coord.x)), floor(ftime + (0.5 * globals.coord.y)));
    float param_1 = float(_240.worldUVModulo);
    float spatialNoise = simplexNoise2Tiled(param, param_1);
    float chaosValue = floor(spatialNoise * 2.0);
    vec2 testCoord = globals.coord + vec2(chaosValue, 0.0);
    vec2 floored = floor((testCoord * scale) - (floor((testCoord * 0.5) * scale) * 2.0));
    bool _1220 = (floored.x - floored.y) < (-0.100000001490116119384765625);
    bool _1231;
    if (!_1220)
    {
        _1231 = (floored.x - floored.y) > 0.100000001490116119384765625;
    }
    else
    {
        _1231 = _1220;
    }
    bool intensity = _1231;
    return float(int(intensity && (spatialNoise > 0.5)));
}

float getShape(uint type, vec2 scale, globalData globals)
{
    switch (int(type))
    {
        case 1:
        {
            return 1.0;
        }
        case 2:
        {
            vec2 param = scale;
            globalData param_1 = globals;
            return shapeGrid(param, param_1);
        }
        case 3:
        {
            vec2 param_2 = scale;
            globalData param_3 = globals;
            return shapeCheckerboard(param_2, param_3);
        }
        case 4:
        {
            vec2 param_4 = scale;
            globalData param_5 = globals;
            return shapeScanlines(param_4, param_5);
        }
        case 5:
        {
            vec2 param_6 = scale;
            globalData param_7 = globals;
            return shapeHazard(param_6, param_7);
        }
        case 6:
        {
            vec2 param_8 = scale;
            globalData param_9 = globals;
            return shapeDiagonalGrid(param_8, param_9);
        }
        case 7:
        {
            vec2 param_10 = scale;
            globalData param_11 = globals;
            return shapeTriangles(param_10, param_11);
        }
        case 8:
        {
            vec2 param_12 = scale;
            globalData param_13 = globals;
            return shapeGlitchSquares(param_12, param_13);
        }
        default:
        {
            return 0.0;
        }
    }
}

vec3 applyShapeOverlay(OverlayLayer ol, vec3 baseColor, globalData globals, bool _inverse)
{
    uint param = ol.shapeAndBlend;
    uint shapeType = getShapeValue(param);
    uint param_1 = ol.shapeAndBlend;
    uint blendType = getBlendModeValue(param_1);
    bool _1310 = ol.cutoff >= 0.0;
    bool _1319;
    if (_1310)
    {
        _1319 = globals.grayscale < ol.cutoff;
    }
    else
    {
        _1319 = _1310;
    }
    if (_1319)
    {
        return baseColor;
    }
    bool _1326 = ol.cutoff < 0.0;
    bool _1335;
    if (_1326)
    {
        _1335 = globals.grayscale > (-ol.cutoff);
    }
    else
    {
        _1335 = _1326;
    }
    if (_1335)
    {
        return baseColor;
    }
    uint param_2 = shapeType;
    vec2 param_3 = ol.scale;
    globalData param_4 = globals;
    float intensity = getShape(param_2, param_3, param_4) * ol.tint.w;
    uint param_5 = blendType;
    vec3 param_6 = baseColor;
    vec3 param_7 = ol.tint.xyz;
    vec3 appliedColor = applyEffect(param_5, param_6, param_7);
    float _1366;
    if (_inverse)
    {
        _1366 = 1.0 - intensity;
    }
    else
    {
        _1366 = intensity;
    }
    return mix(baseColor, appliedColor, vec3(_1366));
}

vec3 applyShapeOverlay(OverlayLayer ol, vec3 baseColor, globalData globals)
{
    OverlayLayer param = ol;
    vec3 param_1 = baseColor;
    globalData param_2 = globals;
    bool param_3 = false;
    return applyShapeOverlay(param, param_1, param_2, param_3);
}

void main()
{
    shaderTint = vec4(0.225995004177093505859375, 0.412744998931884765625, 0.4656859934329986572265625, 1.0);
    textureUVSize = 12.0 / _240.spriteSize.x;
    shaderTransparency = 0.629000008106231689453125;
    bool visualizeBorders = false;
    bool proportionalDistortion = false;
    bool rectangleBound = vTint.w > 0.0;
    bool usesYCoCg = _240.worldScale >= 0.0;
    vec2 vExtra = (vWorld.xy / vec2(128.0)) + (vPos.xy / vec2(abs(_240.worldScale)));
    vExtra = mod(vExtra, vec2(float(_240.worldUVModulo)));
    globalData globals;
    globals.coord = vExtra;
    int tintA = int(255.0 * vTint.x);
    int tintB = int(255.0 * vTint.y);
    vec4 entityTint = vec4(float((tintA >> 4) & 15) / 15.0, float((tintA >> 0) & 15) / 15.0, float((tintB >> 4) & 15) / 15.0, float((tintB >> 0) & 15) / 15.0);
    vec4 _1986 = entityTint;
    vec3 _1988 = _1986.xyz * 1.25;
    entityTint.x = _1988.x;
    entityTint.y = _1988.y;
    entityTint.z = _1988.z;
    entityTint.w *= 2.5;
    float param = globals.coord.y;
    vec3 noises = getPrecalculatedNoise(param);
    globals.distortion1 = noises.x;
    globals.distortion2 = noises.y;
    float distortion_12max = min(globals.distortion1, globals.distortion2);
    globals.distortion12_2 = distortion_12max * distortion_12max;
    globals.distortion3 = noises.z;
    globals.fineDistortion = globals.distortion12_2 - (globals.distortion3 * globals.distortion12_2);
    vec2 stripDistortion = vec2(0.0);
    uint param_1 = 1u;
    vec2 param_2 = vec2(1.0);
    globalData param_3 = globals;
    stripDistortion += (getDistortion(param_1, param_2, param_3) * 1.0);
    uint param_4 = 3u;
    vec2 param_5 = vec2(5.0, 1.059999942779541015625);
    globalData param_6 = globals;
    stripDistortion += (getDistortion(param_4, param_5, param_6) * 0.100000001490116119384765625);
    stripDistortion /= vec2(1.10000002384185791015625);
    float R = vTint.z;
    float B = (1.0 - R) / 2.0;
    B = (1.0 / (2.0 * R)) - 0.5;
    vec2 rawUV = vRawUV;
    rawUV.x = ((1.0 + (2.0 * B)) * rawUV.x) - B;
    float rectangleIntensity = 1.0;
    if (rectangleBound)
    {
        vec2 rectCoord = abs(rawUV - vec2(0.5));
        float dx = max(0.0, max(0.20000000298023223876953125 - rawUV.x, rawUV.x - 0.800000011920928955078125)) * 5.0;
        float dy = max(0.0, max(0.20000000298023223876953125 - rawUV.y, rawUV.y - 0.800000011920928955078125)) * 5.0;
        rectangleIntensity = max(0.0, 1.0 - sqrt((dx * dx) + (dy * dy)));
    }
    vec2 transformedRawUV = rawUV + ((stripDistortion * B) * rectangleIntensity);
    bool _2129 = transformedRawUV.x <= 0.0;
    bool _2136;
    if (!_2129)
    {
        _2136 = transformedRawUV.y <= 0.0;
    }
    else
    {
        _2136 = _2129;
    }
    bool _2143;
    if (!_2136)
    {
        _2143 = transformedRawUV.x >= 1.0;
    }
    else
    {
        _2143 = _2136;
    }
    bool _2150;
    if (!_2143)
    {
        _2150 = transformedRawUV.y >= 1.0;
    }
    else
    {
        _2150 = _2143;
    }
    if (_2150)
    {
        discard;
    }
    stripDistortion *= textureUVSize;
    vec2 transformedUV = vUV + (stripDistortion * rectangleIntensity);
    float alpha = texture(tex2, transformedUV).x;
    vec4 sampledColor = texture(tex, transformedUV);
    vec4 _2182;
    if (usesYCoCg)
    {
        vec4 param_7 = sampledColor;
        float param_8 = alpha;
        _2182 = YCoCgToRGB(param_7, param_8);
    }
    else
    {
        _2182 = sampledColor;
    }
    fragColor = _2182;
    vec4 og = fragColor;
    vec4 _2197 = fragColor;
    vec3 _2199 = _2197.xyz * entityTint.xyz;
    fragColor.x = _2199.x;
    fragColor.y = _2199.y;
    fragColor.z = _2199.z;
    uint param_9 = 6u;
    vec3 param_10 = fragColor.xyz;
    vec3 param_11 = shaderTint.xyz;
    vec3 _2215 = applyEffect(param_9, param_10, param_11);
    fragColor.x = _2215.x;
    fragColor.y = _2215.y;
    fragColor.z = _2215.z;
    fragColor.w *= shaderTransparency;
    globals.grayscale = ((0.2989999949932098388671875 * og.x) + (0.58700001239776611328125 * og.y)) + (0.114000000059604644775390625 * og.z);
    OverlayLayer param_12 = OverlayLayer(720900u, 0.0, vec2(9.03999996185302734375, 6.03999996185302734375), vec4(0.0, 0.841000020503997802734375, 1.0, 0.4939999878406524658203125));
    vec3 param_13 = fragColor.xyz;
    globalData param_14 = globals;
    vec3 _2256 = applyShapeOverlay(param_12, param_13, param_14);
    fragColor.x = _2256.x;
    fragColor.y = _2256.y;
    fragColor.z = _2256.z;
    OverlayLayer param_15 = OverlayLayer(655361u, 0.0, vec2(1.0), vec4(0.529411971569061279296875, 0.2823530137538909912109375, 0.0, 0.078429996967315673828125));
    vec3 param_16 = fragColor.xyz;
    globalData param_17 = globals;
    vec3 _2275 = applyShapeOverlay(param_15, param_16, param_17);
    fragColor.x = _2275.x;
    fragColor.y = _2275.y;
    fragColor.z = _2275.z;
    OverlayLayer param_18 = OverlayLayer(196609u, -1.0, vec2(1.0), vec4(0.117646999657154083251953125, 0.5434830188751220703125, 0.67451000213623046875, 0.75686299800872802734375));
    vec3 param_19 = fragColor.xyz;
    globalData param_20 = globals;
    vec3 _2295 = applyShapeOverlay(param_18, param_19, param_20);
    fragColor.x = _2295.x;
    fragColor.y = _2295.y;
    fragColor.z = _2295.z;
    OverlayLayer param_21 = OverlayLayer(131076u, -0.730000019073486328125, vec2(5.69999980926513671875, 8.27999973297119140625), vec4(1.0, 0.0, 0.0, 0.995999991893768310546875));
    vec3 param_22 = fragColor.xyz;
    globalData param_23 = globals;
    vec3 _2316 = applyShapeOverlay(param_21, param_22, param_23);
    fragColor.x = _2316.x;
    fragColor.y = _2316.y;
    fragColor.z = _2316.z;
    OverlayLayer param_24 = OverlayLayer(65537u, -1.0, vec2(1.0), vec4(0.09890399873256683349609375, 0.605912029743194580078125, 0.960784018039703369140625, 0.16099999845027923583984375));
    vec3 param_25 = fragColor.xyz;
    globalData param_26 = globals;
    vec3 _2336 = applyShapeOverlay(param_24, param_25, param_26);
    fragColor.x = _2336.x;
    fragColor.y = _2336.y;
    fragColor.z = _2336.z;
    OverlayLayer param_27 = OverlayLayer(65540u, 0.0900000035762786865234375, vec2(10.0, -7.11999988555908203125), vec4(0.0, 1.0, 0.087999999523162841796875, 0.5099999904632568359375));
    vec3 param_28 = fragColor.xyz;
    globalData param_29 = globals;
    vec3 _2357 = applyShapeOverlay(param_27, param_28, param_29);
    fragColor.x = _2357.x;
    fragColor.y = _2357.y;
    fragColor.z = _2357.z;
}

