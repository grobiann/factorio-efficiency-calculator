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

struct territoryOverlayUniforms
{
    float4x4 projection;
    float4 stripeColor;
    float4 softBorderColor;
    float4 solidBorderColor;
    float stripeWidth;
    float softBorderWidth;
    float solidBorderWidth;
    float stripeShift;
};

constant spvUnsafeArray<int, 9> _94 = spvUnsafeArray<int, 9>({ 0, 1, 2, 7, 8, 3, 6, 5, 4 });

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    uint chunkData [[user(locn1)]];
};

static inline __attribute__((always_inline))
uint choose(thread const uint& choice, thread const uint& option0, thread const uint& option1)
{
    return ((1u - choice) * option0) + (choice * option1);
}

static inline __attribute__((always_inline))
float circular_clamp(thread const float& value, thread const uint& cap)
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

static inline __attribute__((always_inline))
float isBetween(thread const float& x, thread const float& min_, thread const float& max_)
{
    return step(min_, x) * (1.0 - step(max_, x));
}

static inline __attribute__((always_inline))
float4 choose(thread const uint& choice, thread const float4& option0, thread const float4& option1)
{
    return (option0 * float(1u - choice)) + (option1 * float(choice));
}

static inline __attribute__((always_inline))
uint isWithinBorder(thread const float2& uv, thread const float& borderWidth, thread uint& chunkData)
{
    uint col = uint(step(borderWidth, uv.x) + step(1.0 - borderWidth, uv.x));
    uint row = uint(step(borderWidth, uv.y) + step(1.0 - borderWidth, uv.y));
    uint sector = clamp((row * 3u) + col, 0u, 8u);
    return ((chunkData & 255u) >> uint(_94[sector])) & 1u;
}

fragment main0_out main0(main0_in in [[stage_in]], constant territoryOverlayUniforms& _228 [[buffer(0)]])
{
    main0_out out = {};
    float4 color = float4(0.0);
    uint isInTerritory = (in.chunkData >> uint(8)) & 1u;
    float param = in.vUV.x;
    uint param_1 = 1u;
    float param_2 = in.vUV.y;
    uint param_3 = 1u;
    float2 uv1 = float2(circular_clamp(param, param_1), circular_clamp(param_2, param_3));
    float param_4 = in.vUV.x;
    uint param_5 = 2u;
    float param_6 = in.vUV.y;
    uint param_7 = 2u;
    float2 uv2 = float2(circular_clamp(param_4, param_5), circular_clamp(param_6, param_7));
    float cellVariantShift = float((in.chunkData >> uint(9)) & 1u) * 1.0;
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
    uint stripeC = isInTerritory * uint(trunc(fast::clamp((isBetween(param_10, param_11, param_12) + isBetween(param_13, param_14, param_15)) + isBetween(param_16, param_17, param_18), 0.0, 1.0)));
    uint param_19 = stripeC;
    float4 param_20 = color;
    float4 param_21 = _228.stripeColor;
    color = choose(param_19, param_20, param_21);
    float2 param_22 = uv1;
    float param_23 = _228.softBorderWidth;
    uint softBorderC = isInTerritory * isWithinBorder(param_22, param_23, in.chunkData);
    uint param_24 = softBorderC;
    float4 param_25 = color;
    float4 param_26 = _228.softBorderColor;
    color = choose(param_24, param_25, param_26);
    float2 param_27 = uv1;
    float param_28 = _228.solidBorderWidth;
    uint solidBorderC = isWithinBorder(param_27, param_28, in.chunkData);
    uint param_29 = solidBorderC;
    float4 param_30 = color;
    float4 param_31 = _228.solidBorderColor;
    color = choose(param_29, param_30, param_31);
    out.fragColor = color;
    return out;
}

