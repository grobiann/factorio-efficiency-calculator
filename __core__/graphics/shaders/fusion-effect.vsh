cbuffer vsConstants : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
};


static float4 gl_Position;
static float2 position;
static float2 vUV;
static float2 uv;
static float4 color;
static float4 tint;
static float time;
static float4 fData;
static float fusionPower;
static float plasmaLevel;
static float quality;
static uint2 uData;
static float randomSeed;
static uint extra;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    float4 tint : TEXCOORD2;
    uint extra : TEXCOORD3;
    uint2 uData : TEXCOORD4;
    float4 fData : TEXCOORD5;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float4 color : TEXCOORD1;
    nointerpolation float time : TEXCOORD2;
    nointerpolation float fusionPower : TEXCOORD3;
    nointerpolation float plasmaLevel : TEXCOORD4;
    nointerpolation float quality : TEXCOORD5;
    nointerpolation float randomSeed : TEXCOORD6;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 0.0f, 1.0f), _19_projection);
    vUV = uv;
    color = tint;
    time = fData.x;
    fusionPower = fData.y;
    plasmaLevel = fData.z;
    quality = asfloat(uData.x);
    randomSeed = asfloat(uData.y);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    position = stage_input.position;
    uv = stage_input.uv;
    tint = stage_input.tint;
    fData = stage_input.fData;
    uData = stage_input.uData;
    extra = stage_input.extra;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.color = color;
    stage_output.time = time;
    stage_output.fusionPower = fusionPower;
    stage_output.plasmaLevel = plasmaLevel;
    stage_output.quality = quality;
    stage_output.randomSeed = randomSeed;
    return stage_output;
}
