#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct ParallaxLayerDef
{
    uint beginQuadID;
    uint endQuadID;
    float2 seed;
    float2 gridTopLeftCellID;
    float2 gridOffset;
    float2 gridSize;
    float2 starSize;
    float2 cellBaseVector0;
    float2 cellBaseVector1;
};

struct StarfieldConstants
{
    float4x4 projection;
    float2 resolution;
    float2 backgroundOffset;
    float time;
    float timeRaw;
    float zoom;
    float starsPerCell;
    float starBrightness;
    float starShape;
    float starSaturation;
    int parallaxLayerCount;
    ParallaxLayerDef layers[4];
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float3 vColor [[user(locn1), flat]];
};

static inline __attribute__((always_inline))
float minkowski_distance(thread const float2& p1, thread const float2& p2, constant StarfieldConstants& ub)
{
    float power = ub.starShape;
    float minkowski = powr(powr(abs(p1.x - p2.x), power) + powr(abs(p1.y - p2.y), power), 1.0 / power);
    return minkowski;
}

fragment main0_out main0(main0_in in [[stage_in]], constant StarfieldConstants& ub [[buffer(0)]])
{
    main0_out out = {};
    float3 starColor = in.vColor;
    float BWStars = ((starColor.x + starColor.y) + starColor.z) / 3.0;
    starColor = (starColor * ub.starSaturation) + float3(BWStars * (1.0 - ub.starSaturation));
    float2 param = in.vUV;
    float2 param_1 = float2(0.0);
    float star_mask = minkowski_distance(param, param_1, ub);
    float brightness = powr(fast::max(BWStars - star_mask, 0.0), 5.0);
    out.fragColor = float4(((starColor * brightness) * ub.starBrightness) * 5.0, 0.0);
    return out;
}

