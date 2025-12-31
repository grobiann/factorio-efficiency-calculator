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
    float4 vTint [[user(locn0)]];
    float2 vUVTexture [[user(locn1)]];
    float2 vUVDistortion [[user(locn2)]];
    uint vExtra [[user(locn3)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 position [[attribute(0)]];
    float2 uvTexture [[attribute(1)]];
    float4 tint [[attribute(2)]];
    uint extraData [[attribute(3)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _19 [[buffer(0)]], texture2d<float> distortionUVLookup [[texture(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 1.0);
    out.vUVTexture = in.uvTexture;
    out.vTint = in.tint;
    uint vertexID = uint(int(gl_VertexIndex)) % 4u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 corner = float2(float(i), float(j));
    uint uvLookupIndex = in.extraData >> 8u;
    out.vExtra = in.extraData & 255u;
    if (uvLookupIndex != 0u)
    {
        float4 uvCoords = distortionUVLookup.read(spvTexelBufferCoord((int(uvLookupIndex) - 1)));
        out.vUVDistortion = uvCoords.xy + (corner * uvCoords.zw);
    }
    else
    {
        out.vUVDistortion = float2(-1.0);
    }
    return out;
}

