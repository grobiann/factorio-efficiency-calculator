#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct Thruster
{
    float2 destPosition;
    float padding_1;
    uint quality;
    float thrustRatio;
    float fuelRatio;
    float oxidizerRatio;
    float randomSeed;
};

struct ThrusterJetFlameBatchData
{
    float4x4 projection;
    float time;
    float padding_0;
    float2 size;
    float2 center;
    float2 scale;
    Thruster thrusters[29];
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    uint vQuality [[user(locn1)]];
    float vTime [[user(locn2)]];
    float2 vEffectSize [[user(locn3)]];
    float vThrustRatio [[user(locn4)]];
    float vFuelRatio [[user(locn5)]];
    float vOxidizerRatio [[user(locn6)]];
    float vRandomSeed [[user(locn7)]];
    float4 gl_Position [[position]];
};

vertex main0_out main0(constant ThrusterJetFlameBatchData& _55 [[buffer(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    uint vertexID = uint(int(gl_VertexIndex)) & 3u;
    uint thrusterID = uint(int(gl_VertexIndex)) >> uint(2);
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 uv = float2(float(i), float(j));
    float2 inPosition = (uv * 2.0) - float2(1.0);
    float2 position = ((inPosition * 0.5) * _55.size) * _55.scale;
    position += ((_55.size * 0.5) * _55.scale);
    position = (_55.thrusters[thrusterID].destPosition - (_55.center * _55.scale)) + position;
    out.gl_Position = _55.projection * float4(position, 0.0, 1.0);
    out.vUV = uv;
    out.vQuality = _55.thrusters[thrusterID].quality;
    out.vTime = _55.time;
    out.vEffectSize = _55.size;
    out.vThrustRatio = _55.thrusters[thrusterID].thrustRatio;
    out.vFuelRatio = _55.thrusters[thrusterID].fuelRatio;
    out.vOxidizerRatio = _55.thrusters[thrusterID].oxidizerRatio;
    out.vRandomSeed = _55.thrusters[thrusterID].randomSeed;
    return out;
}

