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

cbuffer ThrusterJetFlameBatchData : register(b0)
{
    row_major float4x4 _55_projection : packoffset(c0);
    float _55_time : packoffset(c4);
    float _55_padding_0 : packoffset(c4.y);
    float2 _55_size : packoffset(c4.z);
    float2 _55_center : packoffset(c5);
    float2 _55_scale : packoffset(c5.z);
    Thruster _55_thrusters[29] : packoffset(c6);
};


static float4 gl_Position;
static int gl_VertexIndex;
static float2 vUV;
static uint vQuality;
static float vTime;
static float2 vEffectSize;
static float vThrustRatio;
static float vFuelRatio;
static float vOxidizerRatio;
static float vRandomSeed;

struct SPIRV_Cross_Input
{
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    nointerpolation uint vQuality : TEXCOORD1;
    nointerpolation float vTime : TEXCOORD2;
    nointerpolation float2 vEffectSize : TEXCOORD3;
    nointerpolation float vThrustRatio : TEXCOORD4;
    nointerpolation float vFuelRatio : TEXCOORD5;
    nointerpolation float vOxidizerRatio : TEXCOORD6;
    nointerpolation float vRandomSeed : TEXCOORD7;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    uint vertexID = uint(gl_VertexIndex) & 3u;
    uint thrusterID = uint(gl_VertexIndex) >> uint(2);
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 uv = float2(float(i), float(j));
    float2 inPosition = (uv * 2.0f) - 1.0f.xx;
    float2 position = ((inPosition * 0.5f) * _55_size) * _55_scale;
    position += ((_55_size * 0.5f) * _55_scale);
    position = (_55_thrusters[thrusterID].destPosition - (_55_center * _55_scale)) + position;
    gl_Position = mul(float4(position, 0.0f, 1.0f), _55_projection);
    vUV = uv;
    vQuality = _55_thrusters[thrusterID].quality;
    vTime = _55_time;
    vEffectSize = _55_size;
    vThrustRatio = _55_thrusters[thrusterID].thrustRatio;
    vFuelRatio = _55_thrusters[thrusterID].fuelRatio;
    vOxidizerRatio = _55_thrusters[thrusterID].oxidizerRatio;
    vRandomSeed = _55_thrusters[thrusterID].randomSeed;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.vQuality = vQuality;
    stage_output.vTime = vTime;
    stage_output.vEffectSize = vEffectSize;
    stage_output.vThrustRatio = vThrustRatio;
    stage_output.vFuelRatio = vFuelRatio;
    stage_output.vOxidizerRatio = vOxidizerRatio;
    stage_output.vRandomSeed = vRandomSeed;
    return stage_output;
}
