#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct vsConstants
{
    float4x4 projection;
};

struct main0_out
{
    float2 vDiffuseUV [[user(locn0)]];
    float2 vNormalUV [[user(locn1)]];
    float2 vRoughnessUV [[user(locn2)]];
    float vAngle [[user(locn3)]];
    float vOpacity [[user(locn4)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 position [[attribute(0)]];
    float2 diffuseUV [[attribute(1)]];
    float2 normalUV [[attribute(2)]];
    float2 roughnessUV [[attribute(3)]];
    float angle [[attribute(4)]];
    float opacity [[attribute(5)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _19 [[buffer(0)]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 1.0);
    out.vDiffuseUV = in.diffuseUV;
    out.vNormalUV = in.normalUV;
    out.vRoughnessUV = in.roughnessUV;
    out.vAngle = in.angle;
    out.vOpacity = in.opacity;
    return out;
}

