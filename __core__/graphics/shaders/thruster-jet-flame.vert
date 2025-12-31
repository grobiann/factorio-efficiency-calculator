#version 330

struct Thruster
{
    vec2 destPosition;
    float padding_1;
    uint quality;
    float thrustRatio;
    float fuelRatio;
    float oxidizerRatio;
    float randomSeed;
};

layout(std140) uniform ThrusterJetFlameBatchData
{
    mat4 projection;
    float time;
    float padding_0;
    vec2 size;
    vec2 center;
    vec2 scale;
    Thruster thrusters[29];
} _55;

out vec2 vUV;
flat out uint vQuality;
flat out float vTime;
flat out vec2 vEffectSize;
flat out float vThrustRatio;
flat out float vFuelRatio;
flat out float vOxidizerRatio;
flat out float vRandomSeed;

void main()
{
    uint vertexID = uint(gl_VertexID) & 3u;
    uint thrusterID = uint(gl_VertexID) >> uint(2);
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    vec2 uv = vec2(float(i), float(j));
    vec2 inPosition = (uv * 2.0) - vec2(1.0);
    vec2 position = ((inPosition * 0.5) * _55.size) * _55.scale;
    position += ((_55.size * 0.5) * _55.scale);
    position = (_55.thrusters[thrusterID].destPosition - (_55.center * _55.scale)) + position;
    gl_Position = _55.projection * vec4(position, 0.0, 1.0);
    vUV = uv;
    vQuality = _55.thrusters[thrusterID].quality;
    vTime = _55.time;
    vEffectSize = _55.size;
    vThrustRatio = _55.thrusters[thrusterID].thrustRatio;
    vFuelRatio = _55.thrusters[thrusterID].fuelRatio;
    vOxidizerRatio = _55.thrusters[thrusterID].oxidizerRatio;
    vRandomSeed = _55.thrusters[thrusterID].randomSeed;
}

