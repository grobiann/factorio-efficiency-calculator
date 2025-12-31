#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

// Returns 2D texture coords corresponding to 1D texel buffer coords
static inline __attribute__((always_inline))
uint2 spvTexelBufferCoord(uint tc)
{
    return uint2(tc % 4096, tc / 4096);
}

struct vsConstants
{
    float4x4 projection;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float4 vColor [[user(locn1)]];
    float4 maskUVs [[user(locn2)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    uint2 masks [[attribute(2)]];
    float4 color [[attribute(3)]];
};

static inline __attribute__((always_inline))
float2 getMaskUV(texture2d<float> coordTable, thread const float2& corner, thread const uint& maskIndex)
{
    float4 mask = coordTable.read(spvTexelBufferCoord(int(maskIndex)));
    return mask.xy + (corner * mask.zw);
}

static inline __attribute__((always_inline))
float decodeTimeScale(thread const uint& val)
{
    float magic = as_type<float>(2004877312u);
    float f = as_type<float>(((val >> uint(4)) & 1023u) << uint(18));
    return f * magic;
}

static inline __attribute__((always_inline))
float decodeDistanceFieldVariation(thread const uint& val)
{
    return 87.5 + (float(val & 15u) * 0.78125);
}

static inline __attribute__((always_inline))
float4 getMaskUVs(texture2d<float> coordTable, thread const uint2& masks, thread uint& gl_VertexIndex)
{
    uint vertexID = uint(int(gl_VertexIndex)) & 3u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 corner = float2(float(i), float(j));
    float2 param = corner;
    uint param_1 = masks.x;
    float2 mask1 = getMaskUV(coordTable, param, param_1);
    uint _115;
    if (masks.y >= 32768u)
    {
        _115 = 0u;
    }
    else
    {
        _115 = masks.y;
    }
    float2 param_2 = corner;
    uint param_3 = _115;
    float2 mask2 = getMaskUV(coordTable, param_2, param_3);
    if (masks.y >= 32768u)
    {
        uint param_4 = masks.y;
        uint param_5 = masks.y;
        mask2 = float2((-2.0) - decodeTimeScale(param_4), decodeDistanceFieldVariation(param_5));
    }
    return float4(mask1, mask2);
}

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _176 [[buffer(0)]], texture2d<float> maskTexCoordTable [[texture(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    out.vColor = in.color;
    out.vUV = in.uv;
    uint2 param = in.masks;
    out.maskUVs = getMaskUVs(maskTexCoordTable, param, gl_VertexIndex);
    out.gl_Position = _176.projection * float4(in.position, 0.0, 1.0);
    return out;
}

