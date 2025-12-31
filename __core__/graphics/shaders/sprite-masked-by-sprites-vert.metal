#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct SpriteMask
{
    float4x4 uvTransform;
    float2 uvMin;
    float2 uvMax;
    uint tint;
    uint extraData;
    float2 padding_;
};

struct spriteMaskUniforms
{
    float4 vertices[4];
    uint tint;
    uint extraData;
    uint numMasks;
    float padding_;
    SpriteMask masks[4];
};

struct vsConstants
{
    float4x4 projection;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float4 vTint [[user(locn1)]];
    uint vExtra [[user(locn2)]];
    float2 vMask0UV [[user(locn3)]];
    float2 vMask1UV [[user(locn4)]];
    float2 vMask2UV [[user(locn5)]];
    float2 vMask3UV [[user(locn6)]];
    float4 gl_Position [[position]];
};

vertex main0_out main0(constant vsConstants& _37 [[buffer(0)]], constant spriteMaskUniforms& _19 [[buffer(1)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    float4 vert = _19.vertices[int(gl_VertexIndex) & 3];
    out.gl_Position = _37.projection * float4(vert.xy, 0.0, 1.0);
    out.vUV = vert.zw;
    out.vTint = float4(float((_19.tint >> uint(0)) & 255u), float((_19.tint >> uint(8)) & 255u), float((_19.tint >> uint(16)) & 255u), float((_19.tint >> uint(24)) & 255u)) / float4(255.0);
    out.vExtra = _19.extraData;
    out.vMask0UV = (_19.masks[0].uvTransform * float4(out.vUV, 0.0, 1.0)).xy;
    out.vMask1UV = (_19.masks[1].uvTransform * float4(out.vUV, 0.0, 1.0)).xy;
    out.vMask2UV = (_19.masks[2].uvTransform * float4(out.vUV, 0.0, 1.0)).xy;
    out.vMask3UV = (_19.masks[3].uvTransform * float4(out.vUV, 0.0, 1.0)).xy;
    return out;
}

