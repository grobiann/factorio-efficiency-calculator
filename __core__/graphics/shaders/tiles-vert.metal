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
    float4 maskUVs [[user(locn1)]];
    uint vFlags [[user(locn2)]];
    float3 vTint [[user(locn3)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float2 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    uint2 masks [[attribute(2)]];
    uint flags [[attribute(3)]];
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
    uint _145;
    if (masks.y >= 32768u)
    {
        _145 = 0u;
    }
    else
    {
        _145 = masks.y;
    }
    float2 param_2 = corner;
    uint param_3 = _145;
    float2 mask2 = getMaskUV(coordTable, param_2, param_3);
    if (masks.y >= 32768u)
    {
        uint param_4 = masks.y;
        uint param_5 = masks.y;
        mask2 = float2((-2.0) - decodeTimeScale(param_4), decodeDistanceFieldVariation(param_5));
    }
    return float4(mask1, mask2);
}

static inline __attribute__((always_inline))
float3 unpackRGB565(thread const int& rgb5)
{
    return float3(int3(rgb5) & int3(63488, 2016, 31));
}

static inline __attribute__((always_inline))
float3 decodeRGB565(thread const int& rgb5)
{
    int param = rgb5;
    return unpackRGB565(param) * float3(1.5751007595099508762359619140625e-05, 0.0004960317746736109256744384765625, 0.0322580635547637939453125);
}

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _215 [[buffer(0)]], texture2d<float> maskTexCoordTable [[texture(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    out.vFlags = in.flags;
    uint2 param = in.masks;
    out.maskUVs = getMaskUVs(maskTexCoordTable, param, gl_VertexIndex);
    int param_1 = int(in.flags >> uint(16));
    out.vTint = decodeRGB565(param_1);
    out.vUV = in.uv;
    out.gl_Position = _215.projection * float4(in.position, 0.0, 1.0);
    return out;
}

