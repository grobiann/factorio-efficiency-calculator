#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"
#pragma clang diagnostic ignored "-Wmissing-braces"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

template<typename T, size_t Num>
struct spvUnsafeArray
{
    T elements[Num ? Num : 1];
    
    thread T& operator [] (size_t pos) thread
    {
        return elements[pos];
    }
    constexpr const thread T& operator [] (size_t pos) const thread
    {
        return elements[pos];
    }
    
    device T& operator [] (size_t pos) device
    {
        return elements[pos];
    }
    constexpr const device T& operator [] (size_t pos) const device
    {
        return elements[pos];
    }
    
    constexpr const constant T& operator [] (size_t pos) const constant
    {
        return elements[pos];
    }
    
    threadgroup T& operator [] (size_t pos) threadgroup
    {
        return elements[pos];
    }
    constexpr const threadgroup T& operator [] (size_t pos) const threadgroup
    {
        return elements[pos];
    }
};

// Implementation of the GLSL mod() function, which is slightly different than Metal fmod()
template<typename Tx, typename Ty>
inline Tx mod(Tx x, Ty y)
{
    return x - y * floor(x / y);
}

struct globalData
{
    float distortion1;
    float distortion2;
    float distortion12_2;
    float distortion3;
    float fineDistortion;
    float grayscale;
    float2 coord;
};

struct OverlayLayer
{
    uint shapeAndBlend;
    float cutoff;
    float2 scale;
    float4 tint;
};

struct fsConstants
{
    float2 spriteSize;
    float time;
    float worldScale;
    uint worldUVModulo;
    float padding0_;
    float padding1_;
    float padding2_;
};

struct fsDistortionConstants
{
    float4 precomputedDistorions[512];
};

struct DistortionLayer
{
    uint shape;
    float intensity;
    float2 scale;
};

constant spvUnsafeArray<OverlayLayer, 6> _2368 = spvUnsafeArray<OverlayLayer, 6>({ OverlayLayer{ 720900u, 0.0, float2(9.03999996185302734375, 6.03999996185302734375), float4(0.0, 0.841000020503997802734375, 1.0, 0.4939999878406524658203125) }, OverlayLayer{ 655361u, 0.0, float2(1.0), float4(0.529411971569061279296875, 0.2823530137538909912109375, 0.0, 0.078429996967315673828125) }, OverlayLayer{ 196609u, -1.0, float2(1.0), float4(0.117646999657154083251953125, 0.5434830188751220703125, 0.67451000213623046875, 0.75686299800872802734375) }, OverlayLayer{ 131076u, -0.730000019073486328125, float2(5.69999980926513671875, 8.27999973297119140625), float4(1.0, 0.0, 0.0, 0.995999991893768310546875) }, OverlayLayer{ 65537u, -1.0, float2(1.0), float4(0.09890399873256683349609375, 0.605912029743194580078125, 0.960784018039703369140625, 0.16099999845027923583984375) }, OverlayLayer{ 65540u, 0.0900000035762786865234375, float2(10.0, -7.11999988555908203125), float4(0.0, 1.0, 0.087999999523162841796875, 0.5099999904632568359375) } });
constant spvUnsafeArray<DistortionLayer, 6> _2374 = spvUnsafeArray<DistortionLayer, 6>({ DistortionLayer{ 1u, 1.0, float2(1.0) }, DistortionLayer{ 3u, 0.100000001490116119384765625, float2(5.0, 1.059999942779541015625) }, DistortionLayer{ 0u, 1.0, float2(1.0) }, DistortionLayer{ 0u, 1.0, float2(1.0) }, DistortionLayer{ 0u, 1.0, float2(1.0) }, DistortionLayer{ 0u, 1.0, float2(1.0) } });

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float2 vRawUV [[user(locn1)]];
    float4 vTint [[user(locn2)]];
    float4 vPos [[user(locn3)]];
    float4 vWorld [[user(locn4)]];
};

static inline __attribute__((always_inline))
float3 getPrecalculatedDistortion(thread const int& index, constant fsDistortionConstants& _1866)
{
    return _1866.precomputedDistorions[index].xyz;
}

static inline __attribute__((always_inline))
float3 getPrecalculatedNoise(thread const float& coordinateY, constant fsDistortionConstants& _1866)
{
    float distortionIndexPrecise = 512.0 * (mod(coordinateY, 32.0) / 32.0);
    int distortionIndexA = int(mod(floor(distortionIndexPrecise), 512.0));
    int distortionIndexB = int(mod(ceil(distortionIndexPrecise), 512.0));
    float weightA = (1.0 - distortionIndexPrecise) + float(distortionIndexA);
    float weightB = 1.0 - weightA;
    int param = distortionIndexA;
    int param_1 = distortionIndexB;
    return (getPrecalculatedDistortion(param, _1866) * weightA) + (getPrecalculatedDistortion(param_1, _1866) * weightB);
}

static inline __attribute__((always_inline))
float smoothFloor(thread const float& a, thread const float& tightness)
{
    return (a - 0.5) - (atan(((-tightness) * sin(6.28318023681640625 * a)) / (1.0 - (tightness * cos(6.28318023681640625 * a)))) / 3.141590118408203125);
}

static inline __attribute__((always_inline))
float smoothFloorPeriodic(thread const float& a, thread const float& period, thread const float& tightness)
{
    float param = a / period;
    float param_1 = tightness;
    return period * smoothFloor(param, param_1);
}

static inline __attribute__((always_inline))
float2 simplexProjectTiled(thread const float2& coord_xy)
{
    return coord_xy + float2(0.5 * coord_xy.y, 0.0);
}

static inline __attribute__((always_inline))
float2 simplexUnprojectTiled(thread const float2& coord_uv)
{
    return coord_uv - float2(0.5 * coord_uv.y, 0.0);
}

static inline __attribute__((always_inline))
float3 permute(thread const float3& x0, thread const float3& p)
{
    float3 x1 = mod(x0 * p.y, float3(p.x));
    return floor(mod((x1 + float3(p.z)) * x0, float3(p.x)));
}

static inline __attribute__((always_inline))
float taylorInvSqrt(thread const float& r)
{
    return 1.43427431583404541015625 - (0.8537347316741943359375 * r);
}

static inline __attribute__((always_inline))
float simplexNoise2Tiled(thread const float2& v, thread const float& period)
{
    float2 param = v;
    float2 i = floor(simplexProjectTiled(param));
    float2 param_1 = i;
    float2 x0 = v - simplexUnprojectTiled(param_1);
    float2 i1 = select(float2(0.0, 1.0), float2(1.0, 0.0), bool2(x0.x > x0.y));
    float2 param_2 = i1;
    float2 x1 = x0 - simplexUnprojectTiled(param_2);
    float2 param_3 = float2(1.0);
    float2 x2 = x0 - simplexUnprojectTiled(param_3);
    float2 i_0 = i;
    float2 i_1 = i + i1;
    float2 i_2 = i + float2(1.0);
    float3 ix = float3(i_0.x, i_1.x, i_2.x);
    float3 iy = float3(i_0.y, i_1.y, i_2.y);
    ix -= ((float3(0.5) * iy) * floor(iy / float3(period)));
    ix = mod(ix, float3(period));
    iy = mod(iy, float3(period));
    float3 param_4 = iy;
    float3 param_5 = float3(289.0, 34.0, 1.0);
    float3 param_6 = permute(param_4, param_5) + ix;
    float3 param_7 = float3(289.0, 34.0, 1.0);
    float3 p = permute(param_6, param_7);
    float3 x = fract(p / float3(7.0));
    float3 h = float3(0.5) - abs(x);
    float3 sx = (float3(x < float3(0.0)) * 2.0) - float3(1.0);
    float3 sh = float3(h < float3(0.0));
    float3 a0 = x + (sx * sh);
    float2 p0 = float2(a0.x, h.x);
    float2 p1 = float2(a0.y, h.y);
    float2 p2 = float2(a0.z, h.z);
    float param_8 = dot(p0, p0);
    p0 *= taylorInvSqrt(param_8);
    float param_9 = dot(p1, p1);
    p1 *= taylorInvSqrt(param_9);
    float param_10 = dot(p2, p2);
    p2 *= taylorInvSqrt(param_10);
    float3 g = float3(dot(p0, x0), dot(p1, x1), dot(p2, x2));
    float3 m = fast::max(float3(0.800000011920928955078125) - float3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), float3(0.0));
    m *= m;
    return 0.5 + (10.0 * dot(m * m, g));
}

static inline __attribute__((always_inline))
float2 distortionScanlines(thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    float param = _240.time;
    float param_1 = 15.0;
    float param_2 = 0.0500000007450580596923828125;
    float param_3 = 0.5 * globals.coord.y;
    float param_4 = 0.0500000007450580596923828125;
    float2 param_5 = float2(smoothFloorPeriodic(param, param_1, param_2) / 15.0, smoothFloor(param_3, param_4));
    float param_6 = float(_240.worldUVModulo);
    float randomDirectionStripWide = (-1.0) + (2.0 * simplexNoise2Tiled(param_5, param_6));
    float shimmerAmount = 2.0 * randomDirectionStripWide;
    shimmerAmount *= (globals.distortion3 * globals.distortion12_2);
    return float2(shimmerAmount, 0.0);
}

static inline __attribute__((always_inline))
float2 distortionSin(thread const float2& scale, thread const globalData& globals)
{
    return float2(sin(globals.coord.y * scale.x), 0.0);
}

static inline __attribute__((always_inline))
float2 distortionSinMove(thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    return float2(sin((globals.coord.y * scale.x) + (_240.time * scale.y)), 0.0);
}

static inline __attribute__((always_inline))
float2 smallRand(thread const float2& co)
{
    return (float2(fract(sin(dot(co, float2(12.98980045318603515625, 78.233001708984375))) * 43758.546875), fract(cos(dot(co.yx, float2(8.64947032928466796875, 45.0970001220703125))) * 43758.546875)) * 2.0) - float2(1.0);
}

static inline __attribute__((always_inline))
float2 distortionBubbles(thread const float2& scale, thread const globalData& globals)
{
    float2 cellID = floor(globals.coord * 0.25);
    float2 fractCoord = fract(globals.coord * 0.25);
    float dx = fast::max(0.0, fast::max(0.20000000298023223876953125 - fractCoord.x, fractCoord.x - 0.800000011920928955078125)) * 5.0;
    float dy = fast::max(0.0, fast::max(0.20000000298023223876953125 - fractCoord.y, fractCoord.y - 0.800000011920928955078125)) * 5.0;
    float rectIntensity = fast::max(0.0, 1.0 - sqrt((dx * dx) + (dy * dy)));
    float safeRange = fast::max(1.0, scale.y);
    float2 center = (fractCoord * 2.0) - float2(1.0);
    float2 param = cellID;
    center += ((smallRand(param) * 0.5) * scale.x);
    float param_1 = length(center * 8.0);
    return float2((((rectIntensity * powr(2.0, (-(param_1 - scale.y)) * (param_1 - scale.y))) * sign(-center.x)) * fast::min(1.0, abs(center.x / safeRange))) / safeRange, 0.0);
}

static inline __attribute__((always_inline))
float2 distortionBubblesMove(thread float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    float interval = 20.0;
    float2 param = floor(globals.coord * 0.25);
    float2 notimerng = smallRand(param);
    float2 cellID = floor(globals.coord * 0.25) + float2(floor(_240.time + notimerng.x));
    float2 param_1 = cellID;
    float2 rng = smallRand(param_1);
    scale.y = interval * fract(((scale.y / interval) + fract(_240.time + notimerng.x)) - 0.100000001490116119384765625);
    float2 fractCoord = fract(globals.coord * 0.25);
    float dx = fast::max(0.0, fast::max(0.20000000298023223876953125 - fractCoord.x, fractCoord.x - 0.800000011920928955078125)) * 5.0;
    float dy = fast::max(0.0, fast::max(0.20000000298023223876953125 - fractCoord.y, fractCoord.y - 0.800000011920928955078125)) * 5.0;
    float rectIntensity = fast::max(0.0, 1.0 - sqrt((dx * dx) + (dy * dy)));
    float safeRange = fast::max(1.0, scale.y);
    float2 center = (fractCoord * 2.0) - float2(1.0);
    center += ((rng * 0.5) * scale.x);
    float param_2 = length(center * 8.0);
    return float2((((rectIntensity * powr(2.0, (-(param_2 - scale.y)) * (param_2 - scale.y))) * sign(-center.x)) * fast::min(1.0, abs(center.x / safeRange))) / safeRange, 0.0);
}

static inline __attribute__((always_inline))
float2 distortionGlitchSquares(thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    float2 fCoord = floor(globals.coord);
    float ftime = floor((sin(fCoord.x) + cos(fCoord.y)) + (_240.time * 0.20000000298023223876953125));
    float2 param = float2(floor(ftime + (0.5 * globals.coord.x)), floor(ftime + (0.5 * globals.coord.y)));
    float param_1 = float(_240.worldUVModulo);
    float spatialNoise = simplexNoise2Tiled(param, param_1);
    float chaosValue = floor(spatialNoise * 2.0);
    float2 testCoord = globals.coord + float2(chaosValue, 0.0);
    float2 floored = floor((testCoord * scale) - (floor((testCoord * 0.5) * scale) * 2.0));
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
    float2 _1780;
    if (intensity && (spatialNoise > 0.5))
    {
        float2 param_2 = float2((100.0 * _240.time) + (20.0 * globals.coord.x), (100.0 * _240.time) + (20.0 * globals.coord.y));
        float param_3 = float(_240.worldUVModulo);
        _1780 = float2(1.0 - (2.0 * simplexNoise2Tiled(param_2, param_3)), 0.0);
    }
    else
    {
        _1780 = float2(0.0);
    }
    return _1780;
}

static inline __attribute__((always_inline))
float2 getDistortion(thread const uint& type, thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    switch (int(type))
    {
        case 1:
        {
            float2 param = scale;
            globalData param_1 = globals;
            return distortionScanlines(param, param_1, _240);
        }
        case 2:
        {
            float2 param_2 = scale;
            globalData param_3 = globals;
            return distortionSin(param_2, param_3);
        }
        case 3:
        {
            float2 param_4 = scale;
            globalData param_5 = globals;
            return distortionSinMove(param_4, param_5, _240);
        }
        case 4:
        {
            float2 param_6 = scale;
            globalData param_7 = globals;
            return distortionBubbles(param_6, param_7);
        }
        case 5:
        {
            float2 param_8 = scale;
            globalData param_9 = globals;
            float2 _1852 = distortionBubblesMove(param_8, param_9, _240);
            return _1852;
        }
        case 6:
        {
            float2 param_10 = scale;
            globalData param_11 = globals;
            return distortionGlitchSquares(param_10, param_11, _240);
        }
        default:
        {
            return float2(0.0);
        }
    }
}

static inline __attribute__((always_inline))
float4 YCoCgToRGB(thread const float4& ycocg, thread const float& alpha)
{
    float Y = ycocg.w;
    float scale = 1.0 / ((31.875 * ycocg.z) + 1.0);
    float Co = (ycocg.x - 0.501960813999176025390625) * scale;
    float Cg = (ycocg.y - 0.501960813999176025390625) * scale;
    float R = (Y + Co) - Cg;
    float G = Y + Cg;
    float B = (Y - Co) - Cg;
    return float4(R, G, B, alpha);
}

static inline __attribute__((always_inline))
float3 screen(thread const float3& a, thread const float3& b)
{
    return float3(1.0) - ((float3(1.0) - a) * (float3(1.0) - b));
}

static inline __attribute__((always_inline))
float3 multiply(thread const float3& a, thread const float3& b)
{
    return a * b;
}

static inline __attribute__((always_inline))
float overlay(thread const float& a, thread const float& b)
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

static inline __attribute__((always_inline))
float3 overlay(thread const float3& a, thread const float3& b)
{
    float param = a.x;
    float param_1 = b.x;
    float param_2 = a.y;
    float param_3 = b.y;
    float param_4 = a.z;
    float param_5 = b.z;
    return float3(overlay(param, param_1), overlay(param_2, param_3), overlay(param_4, param_5));
}

static inline __attribute__((always_inline))
float3 hardLight(thread const float3& a, thread const float3& b)
{
    float param = b.x;
    float param_1 = a.x;
    float param_2 = b.y;
    float param_3 = a.y;
    float param_4 = b.z;
    float param_5 = a.z;
    return float3(overlay(param, param_1), overlay(param_2, param_3), overlay(param_4, param_5));
}

static inline __attribute__((always_inline))
float softLight(thread const float& a, thread const float& b)
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

static inline __attribute__((always_inline))
float3 softLight(thread const float3& a, thread const float3& b)
{
    float param = a.x;
    float param_1 = b.x;
    float param_2 = a.y;
    float param_3 = b.y;
    float param_4 = a.z;
    float param_5 = b.z;
    return float3(softLight(param, param_1), softLight(param_2, param_3), softLight(param_4, param_5));
}

static inline __attribute__((always_inline))
float3 colorDodge(thread const float3& a, thread const float3& b)
{
    return a / (float3(1.0) - b);
}

static inline __attribute__((always_inline))
float3 add(thread const float3& a, thread const float3& b)
{
    return a + b;
}

static inline __attribute__((always_inline))
float3 divide0(thread const float3& a, thread const float3& b)
{
    return a / b;
}

static inline __attribute__((always_inline))
float3 colorBurn(thread const float3& a, thread const float3& b)
{
    return float3(1.0) - ((float3(1.0) - a) / b);
}

static inline __attribute__((always_inline))
float3 subtract(thread const float3& a, thread const float3& b)
{
    return a - b;
}

static inline __attribute__((always_inline))
float difference(thread const float& a, thread const float& b)
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

static inline __attribute__((always_inline))
float3 difference(thread const float3& a, thread const float3& b)
{
    float param = a.x;
    float param_1 = b.x;
    float param_2 = a.y;
    float param_3 = b.y;
    float param_4 = a.z;
    float param_5 = b.z;
    return float3(difference(param, param_1), difference(param_2, param_3), difference(param_4, param_5));
}

static inline __attribute__((always_inline))
float3 darken(thread const float3& a, thread const float3& b)
{
    return fast::min(a, b);
}

static inline __attribute__((always_inline))
float3 lighten(thread const float3& a, thread const float3& b)
{
    return fast::max(a, b);
}

static inline __attribute__((always_inline))
float3 applyEffect(thread const uint& type, thread const float3& a, thread const float3& b)
{
    switch (int(type))
    {
        case 1:
        {
            float3 param = a;
            float3 param_1 = b;
            return screen(param, param_1);
        }
        case 2:
        {
            float3 param_2 = a;
            float3 param_3 = b;
            return multiply(param_2, param_3);
        }
        case 3:
        {
            float3 param_4 = a;
            float3 param_5 = b;
            return overlay(param_4, param_5);
        }
        case 4:
        {
            float3 param_6 = a;
            float3 param_7 = b;
            return hardLight(param_6, param_7);
        }
        case 5:
        {
            float3 param_8 = a;
            float3 param_9 = b;
            return softLight(param_8, param_9);
        }
        case 6:
        {
            float3 param_10 = a;
            float3 param_11 = b;
            return colorDodge(param_10, param_11);
        }
        case 7:
        {
            float3 param_12 = a;
            float3 param_13 = b;
            return add(param_12, param_13);
        }
        case 8:
        {
            float3 param_14 = a;
            float3 param_15 = b;
            return divide0(param_14, param_15);
        }
        case 9:
        {
            float3 param_16 = a;
            float3 param_17 = b;
            return colorBurn(param_16, param_17);
        }
        case 10:
        {
            float3 param_18 = a;
            float3 param_19 = b;
            return subtract(param_18, param_19);
        }
        case 11:
        {
            float3 param_20 = a;
            float3 param_21 = b;
            return difference(param_20, param_21);
        }
        case 12:
        {
            float3 param_22 = a;
            float3 param_23 = b;
            return darken(param_22, param_23);
        }
        case 13:
        {
            float3 param_24 = a;
            float3 param_25 = b;
            return lighten(param_24, param_25);
        }
        default:
        {
            return b;
        }
    }
}

static inline __attribute__((always_inline))
uint getShapeValue(thread const uint& arg)
{
    return (arg >> uint(0)) & 65535u;
}

static inline __attribute__((always_inline))
uint getBlendModeValue(thread const uint& arg)
{
    return (arg >> uint(16)) & 65535u;
}

static inline __attribute__((always_inline))
float shapeGrid(thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    float2 scaled = globals.coord * scale;
    float gridCoordX = ((2.0 * (0.300000011920928955078125 + scaled.x)) + (0.0199999995529651641845703125 * sin(5.0 * scaled.y))) + ((0.0199999995529651641845703125 * sin(((-11.0) * _240.time) + (50.0 * scaled.y))) * sin((10.0 * _240.time) + (60.0 * scaled.y)));
    float gridCoordY = 2.0 * (0.300000011920928955078125 + scaled.y);
    return fast::max(powr(2.0 * ((gridCoordX - floor(gridCoordX)) - 0.5), 4.0), powr(2.0 * ((gridCoordY - floor(gridCoordY)) - 0.5), 4.0));
}

static inline __attribute__((always_inline))
float shapeCheckerboard(thread const float2& scale, thread const globalData& globals)
{
    float2 floored = floor((globals.coord * scale) - (floor((globals.coord * 0.5) * scale) * 2.0));
    return abs(floored.x - floored.y);
}

static inline __attribute__((always_inline))
float shapeScanlines(thread const float2& scale, thread const globalData& globals)
{
    return abs(globals.fineDistortion);
}

static inline __attribute__((always_inline))
float shapeHazard(thread const float2& scale, thread const globalData& globals)
{
    float2 scaled = globals.coord * scale;
    return float(int(mod(scaled.x - scaled.y, 2.0) > 1.0));
}

static inline __attribute__((always_inline))
float shapeDiagonalGrid(thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    float2 scaled = globals.coord * scale;
    scaled = float2((scaled.x * 0.707099974155426025390625) - (scaled.y * 0.707099974155426025390625), (scaled.x * 0.707099974155426025390625) + (scaled.y * 0.707099974155426025390625));
    float gridCoordX = ((2.0 * (0.300000011920928955078125 + scaled.x)) + (0.0199999995529651641845703125 * sin(5.0 * scaled.y))) + ((0.0199999995529651641845703125 * sin(((-11.0) * _240.time) + (50.0 * scaled.y))) * sin((10.0 * _240.time) + (60.0 * scaled.y)));
    float gridCoordY = 2.0 * (0.300000011920928955078125 + scaled.y);
    return fast::max(powr(2.0 * ((gridCoordX - floor(gridCoordX)) - 0.5), 4.0), powr(2.0 * ((gridCoordY - floor(gridCoordY)) - 0.5), 4.0));
}

static inline __attribute__((always_inline))
float shapeTriangles(thread const float2& scale, thread const globalData& globals)
{
    float2 scaled = globals.coord * float2(scale.x, scale.x);
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

static inline __attribute__((always_inline))
float shapeGlitchSquares(thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    float2 fCoord = floor(globals.coord);
    float ftime = floor((sin(fCoord.x) + cos(fCoord.y)) + (_240.time * 0.20000000298023223876953125));
    float2 param = float2(floor(ftime + (0.5 * globals.coord.x)), floor(ftime + (0.5 * globals.coord.y)));
    float param_1 = float(_240.worldUVModulo);
    float spatialNoise = simplexNoise2Tiled(param, param_1);
    float chaosValue = floor(spatialNoise * 2.0);
    float2 testCoord = globals.coord + float2(chaosValue, 0.0);
    float2 floored = floor((testCoord * scale) - (floor((testCoord * 0.5) * scale) * 2.0));
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

static inline __attribute__((always_inline))
float getShape(thread const uint& type, thread const float2& scale, thread const globalData& globals, constant fsConstants& _240)
{
    switch (int(type))
    {
        case 1:
        {
            return 1.0;
        }
        case 2:
        {
            float2 param = scale;
            globalData param_1 = globals;
            return shapeGrid(param, param_1, _240);
        }
        case 3:
        {
            float2 param_2 = scale;
            globalData param_3 = globals;
            return shapeCheckerboard(param_2, param_3);
        }
        case 4:
        {
            float2 param_4 = scale;
            globalData param_5 = globals;
            return shapeScanlines(param_4, param_5);
        }
        case 5:
        {
            float2 param_6 = scale;
            globalData param_7 = globals;
            return shapeHazard(param_6, param_7);
        }
        case 6:
        {
            float2 param_8 = scale;
            globalData param_9 = globals;
            return shapeDiagonalGrid(param_8, param_9, _240);
        }
        case 7:
        {
            float2 param_10 = scale;
            globalData param_11 = globals;
            return shapeTriangles(param_10, param_11);
        }
        case 8:
        {
            float2 param_12 = scale;
            globalData param_13 = globals;
            return shapeGlitchSquares(param_12, param_13, _240);
        }
        default:
        {
            return 0.0;
        }
    }
}

static inline __attribute__((always_inline))
float3 applyShapeOverlay(thread const OverlayLayer& ol, thread const float3& baseColor, thread const globalData& globals, thread const bool& _inverse, constant fsConstants& _240)
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
    float2 param_3 = ol.scale;
    globalData param_4 = globals;
    float intensity = getShape(param_2, param_3, param_4, _240) * ol.tint.w;
    uint param_5 = blendType;
    float3 param_6 = baseColor;
    float3 param_7 = ol.tint.xyz;
    float3 appliedColor = applyEffect(param_5, param_6, param_7);
    float _1366;
    if (_inverse)
    {
        _1366 = 1.0 - intensity;
    }
    else
    {
        _1366 = intensity;
    }
    return mix(baseColor, appliedColor, float3(_1366));
}

static inline __attribute__((always_inline))
float3 applyShapeOverlay(thread const OverlayLayer& ol, thread const float3& baseColor, thread const globalData& globals, constant fsConstants& _240)
{
    OverlayLayer param = ol;
    float3 param_1 = baseColor;
    globalData param_2 = globals;
    bool param_3 = false;
    return applyShapeOverlay(param, param_1, param_2, param_3, _240);
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsDistortionConstants& _1866 [[buffer(1)]], constant fsConstants& _240 [[buffer(2)]], texture2d<float> tex [[texture(0)]], texture2d<float> tex2 [[texture(1)]], sampler texSmplr [[sampler(0)]], sampler tex2Smplr [[sampler(1)]])
{
    main0_out out = {};
    float4 shaderTint = float4(0.225995004177093505859375, 0.412744998931884765625, 0.4656859934329986572265625, 1.0);
    float textureUVSize = 12.0 / _240.spriteSize.x;
    float shaderTransparency = 0.629000008106231689453125;
    bool visualizeBorders = false;
    bool proportionalDistortion = false;
    bool rectangleBound = in.vTint.w > 0.0;
    bool usesYCoCg = _240.worldScale >= 0.0;
    float2 vExtra = (in.vWorld.xy / float2(128.0)) + (in.vPos.xy / float2(abs(_240.worldScale)));
    vExtra = mod(vExtra, float2(float(_240.worldUVModulo)));
    globalData globals;
    globals.coord = vExtra;
    int tintA = int(255.0 * in.vTint.x);
    int tintB = int(255.0 * in.vTint.y);
    float4 entityTint = float4(float((tintA >> 4) & 15) / 15.0, float((tintA >> 0) & 15) / 15.0, float((tintB >> 4) & 15) / 15.0, float((tintB >> 0) & 15) / 15.0);
    float4 _1986 = entityTint;
    float3 _1988 = _1986.xyz * 1.25;
    entityTint.x = _1988.x;
    entityTint.y = _1988.y;
    entityTint.z = _1988.z;
    entityTint.w *= 2.5;
    float param = globals.coord.y;
    float3 noises = getPrecalculatedNoise(param, _1866);
    globals.distortion1 = noises.x;
    globals.distortion2 = noises.y;
    float distortion_12max = fast::min(globals.distortion1, globals.distortion2);
    globals.distortion12_2 = distortion_12max * distortion_12max;
    globals.distortion3 = noises.z;
    globals.fineDistortion = globals.distortion12_2 - (globals.distortion3 * globals.distortion12_2);
    float2 stripDistortion = float2(0.0);
    uint param_1 = 1u;
    float2 param_2 = float2(1.0);
    globalData param_3 = globals;
    stripDistortion += (getDistortion(param_1, param_2, param_3, _240) * 1.0);
    uint param_4 = 3u;
    float2 param_5 = float2(5.0, 1.059999942779541015625);
    globalData param_6 = globals;
    stripDistortion += (getDistortion(param_4, param_5, param_6, _240) * 0.100000001490116119384765625);
    stripDistortion /= float2(1.10000002384185791015625);
    float R = in.vTint.z;
    float B = (1.0 - R) / 2.0;
    B = (1.0 / (2.0 * R)) - 0.5;
    float2 rawUV = in.vRawUV;
    rawUV.x = ((1.0 + (2.0 * B)) * rawUV.x) - B;
    float rectangleIntensity = 1.0;
    if (rectangleBound)
    {
        float2 rectCoord = abs(rawUV - float2(0.5));
        float dx = fast::max(0.0, fast::max(0.20000000298023223876953125 - rawUV.x, rawUV.x - 0.800000011920928955078125)) * 5.0;
        float dy = fast::max(0.0, fast::max(0.20000000298023223876953125 - rawUV.y, rawUV.y - 0.800000011920928955078125)) * 5.0;
        rectangleIntensity = fast::max(0.0, 1.0 - sqrt((dx * dx) + (dy * dy)));
    }
    float2 transformedRawUV = rawUV + ((stripDistortion * B) * rectangleIntensity);
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
        discard_fragment();
    }
    stripDistortion *= textureUVSize;
    float2 transformedUV = in.vUV + (stripDistortion * rectangleIntensity);
    float alpha = tex2.sample(tex2Smplr, transformedUV).x;
    float4 sampledColor = tex.sample(texSmplr, transformedUV);
    float4 _2182;
    if (usesYCoCg)
    {
        float4 param_7 = sampledColor;
        float param_8 = alpha;
        _2182 = YCoCgToRGB(param_7, param_8);
    }
    else
    {
        _2182 = sampledColor;
    }
    out.fragColor = _2182;
    float4 og = out.fragColor;
    float4 _2197 = out.fragColor;
    float3 _2199 = _2197.xyz * entityTint.xyz;
    out.fragColor.x = _2199.x;
    out.fragColor.y = _2199.y;
    out.fragColor.z = _2199.z;
    uint param_9 = 6u;
    float3 param_10 = out.fragColor.xyz;
    float3 param_11 = shaderTint.xyz;
    float3 _2215 = applyEffect(param_9, param_10, param_11);
    out.fragColor.x = _2215.x;
    out.fragColor.y = _2215.y;
    out.fragColor.z = _2215.z;
    out.fragColor.w *= shaderTransparency;
    globals.grayscale = ((0.2989999949932098388671875 * og.x) + (0.58700001239776611328125 * og.y)) + (0.114000000059604644775390625 * og.z);
    OverlayLayer param_12 = OverlayLayer{ 720900u, 0.0, float2(9.03999996185302734375, 6.03999996185302734375), float4(0.0, 0.841000020503997802734375, 1.0, 0.4939999878406524658203125) };
    float3 param_13 = out.fragColor.xyz;
    globalData param_14 = globals;
    float3 _2256 = applyShapeOverlay(param_12, param_13, param_14, _240);
    out.fragColor.x = _2256.x;
    out.fragColor.y = _2256.y;
    out.fragColor.z = _2256.z;
    OverlayLayer param_15 = OverlayLayer{ 655361u, 0.0, float2(1.0), float4(0.529411971569061279296875, 0.2823530137538909912109375, 0.0, 0.078429996967315673828125) };
    float3 param_16 = out.fragColor.xyz;
    globalData param_17 = globals;
    float3 _2275 = applyShapeOverlay(param_15, param_16, param_17, _240);
    out.fragColor.x = _2275.x;
    out.fragColor.y = _2275.y;
    out.fragColor.z = _2275.z;
    OverlayLayer param_18 = OverlayLayer{ 196609u, -1.0, float2(1.0), float4(0.117646999657154083251953125, 0.5434830188751220703125, 0.67451000213623046875, 0.75686299800872802734375) };
    float3 param_19 = out.fragColor.xyz;
    globalData param_20 = globals;
    float3 _2295 = applyShapeOverlay(param_18, param_19, param_20, _240);
    out.fragColor.x = _2295.x;
    out.fragColor.y = _2295.y;
    out.fragColor.z = _2295.z;
    OverlayLayer param_21 = OverlayLayer{ 131076u, -0.730000019073486328125, float2(5.69999980926513671875, 8.27999973297119140625), float4(1.0, 0.0, 0.0, 0.995999991893768310546875) };
    float3 param_22 = out.fragColor.xyz;
    globalData param_23 = globals;
    float3 _2316 = applyShapeOverlay(param_21, param_22, param_23, _240);
    out.fragColor.x = _2316.x;
    out.fragColor.y = _2316.y;
    out.fragColor.z = _2316.z;
    OverlayLayer param_24 = OverlayLayer{ 65537u, -1.0, float2(1.0), float4(0.09890399873256683349609375, 0.605912029743194580078125, 0.960784018039703369140625, 0.16099999845027923583984375) };
    float3 param_25 = out.fragColor.xyz;
    globalData param_26 = globals;
    float3 _2336 = applyShapeOverlay(param_24, param_25, param_26, _240);
    out.fragColor.x = _2336.x;
    out.fragColor.y = _2336.y;
    out.fragColor.z = _2336.z;
    OverlayLayer param_27 = OverlayLayer{ 65540u, 0.0900000035762786865234375, float2(10.0, -7.11999988555908203125), float4(0.0, 1.0, 0.087999999523162841796875, 0.5099999904632568359375) };
    float3 param_28 = out.fragColor.xyz;
    globalData param_29 = globals;
    float3 _2357 = applyShapeOverlay(param_27, param_28, param_29, _240);
    out.fragColor.x = _2357.x;
    out.fragColor.y = _2357.y;
    out.fragColor.z = _2357.z;
    return out;
}

