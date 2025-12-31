cbuffer vsConstants : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
};

Buffer<float4> distortionUVLookup : register(t0);

static float4 gl_Position;
static int gl_VertexIndex;
static float3 position;
static float2 vUVTexture;
static float2 uvTexture;
static float4 vTint;
static float4 tint;
static uint extraData;
static uint vExtra;
static float2 vUVDistortion;

struct SPIRV_Cross_Input
{
    float3 position : TEXCOORD0;
    float2 uvTexture : TEXCOORD1;
    float4 tint : TEXCOORD2;
    uint extraData : TEXCOORD3;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float4 vTint : TEXCOORD0;
    float2 vUVTexture : TEXCOORD1;
    float2 vUVDistortion : TEXCOORD2;
    nointerpolation uint vExtra : TEXCOORD3;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 1.0f), _19_projection);
    vUVTexture = uvTexture;
    vTint = tint;
    uint vertexID = uint(gl_VertexIndex) % 4u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 corner = float2(float(i), float(j));
    uint uvLookupIndex = extraData >> 8u;
    vExtra = extraData & 255u;
    if (uvLookupIndex != 0u)
    {
        float4 uvCoords = distortionUVLookup.Load(int(uvLookupIndex) - 1);
        vUVDistortion = uvCoords.xy + (corner * uvCoords.zw);
    }
    else
    {
        vUVDistortion = (-1.0f).xx;
    }
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    position = stage_input.position;
    uvTexture = stage_input.uvTexture;
    tint = stage_input.tint;
    extraData = stage_input.extraData;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUVTexture = vUVTexture;
    stage_output.vTint = vTint;
    stage_output.vExtra = vExtra;
    stage_output.vUVDistortion = vUVDistortion;
    return stage_output;
}
