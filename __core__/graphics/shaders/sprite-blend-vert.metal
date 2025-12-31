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
    float2 vUV1 [[user(locn0)]];
    float2 vUV2 [[user(locn1)]];
    float4 vTint [[user(locn2)]];
    uint vExtra [[user(locn3)]];
    float vRatio [[user(locn4)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 position [[attribute(0)]];
    float2 ratioAndIndex [[attribute(1)]];
    float4 tint [[attribute(2)]];
    uint extra [[attribute(3)]];
};

static inline __attribute__((always_inline))
float2 fetchUV(thread const int& uvLookupIndex, thread uint& gl_VertexIndex, texture2d<float> uvLookup)
{
    uint vertexID = uint(int(gl_VertexIndex)) % 4u;
    float4 uvCoords = uvLookup.read(spvTexelBufferCoord(uvLookupIndex));
    return uvCoords.xy + (float2(float(vertexID / 2u), float(vertexID % 2u)) * uvCoords.zw);
}

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _59 [[buffer(0)]], texture2d<float> uvLookup [[texture(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    out.gl_Position = _59.projection * float4(in.position, 1.0);
    int param = int(in.ratioAndIndex.y);
    out.vUV1 = fetchUV(param, gl_VertexIndex, uvLookup);
    int param_1 = int(in.extra >> uint(8));
    out.vUV2 = fetchUV(param_1, gl_VertexIndex, uvLookup);
    out.vTint = in.tint;
    out.vExtra = in.extra & 255u;
    out.vRatio = in.ratioAndIndex.x;
    return out;
}

