cbuffer territoryOverlayUniforms : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
    float4 _19_stripeColor : packoffset(c4);
    float4 _19_softBorderColor : packoffset(c5);
    float4 _19_solidBorderColor : packoffset(c6);
    float _19_stripeWidth : packoffset(c7);
    float _19_softBorderWidth : packoffset(c7.y);
    float _19_solidBorderWidth : packoffset(c7.z);
    float _19_stripeShift : packoffset(c7.w);
};


static float4 gl_Position;
static float2 position;
static float2 vUV;
static float2 uv;
static uint chunkData;
static uint inChunkData;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    uint inChunkData : TEXCOORD2;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    nointerpolation uint chunkData : TEXCOORD1;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 0.0f, 1.0f), _19_projection);
    vUV = uv;
    chunkData = inChunkData;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    position = stage_input.position;
    uv = stage_input.uv;
    inChunkData = stage_input.inChunkData;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.chunkData = chunkData;
    return stage_output;
}
