#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct TurretRangeData
{
    float4 posAndRadius;
    float4 rangeBoundNormals;
};

struct turretRangeData
{
    int dataSize;
    float4 color;
    TurretRangeData data[511];
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

fragment main0_out main0(constant turretRangeData& _28 [[buffer(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    out.fragColor = float4(0.0);
    for (int i = 0; i < _28.dataSize; i++)
    {
        float2 pos = _28.data[i].posAndRadius.xy;
        float2 startVec = _28.data[i].rangeBoundNormals.xy;
        float2 endVec = _28.data[i].rangeBoundNormals.zw;
        float2 delta = gl_FragCoord.xy - pos;
        float2 normal = float2(delta.y, -delta.x);
        float dist = dot(delta, delta);
        float crossA = dot(startVec, normal);
        float crossB = dot(endVec, normal);
        float maxRadiusSquared = _28.data[i].posAndRadius.z;
        float minRadiusSquared = _28.data[i].posAndRadius.w;
        if (all(bool4(crossA >= 0.0, crossB <= 0.0, dist < maxRadiusSquared, dist > minRadiusSquared)))
        {
            out.fragColor = _28.color;
            break;
        }
    }
    return out;
}

