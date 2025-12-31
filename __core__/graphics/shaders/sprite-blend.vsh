cbuffer vsConstants : register(b0)
{
    row_major float4x4 _59_projection : packoffset(c0);
};

Buffer<float4> uvLookup : register(t0);

static float4 gl_Position;
static int gl_VertexIndex;
static float3 position;
static float2 vUV1;
static float2 ratioAndIndex;
static float2 vUV2;
static uint extra;
static float4 vTint;
static float4 tint;
static uint vExtra;
static float vRatio;

struct SPIRV_Cross_Input
{
    float3 position : TEXCOORD0;
    float2 ratioAndIndex : TEXCOORD1;
    float4 tint : TEXCOORD2;
    uint extra : TEXCOORD3;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV1 : TEXCOORD0;
    float2 vUV2 : TEXCOORD1;
    float4 vTint : TEXCOORD2;
    nointerpolation uint vExtra : TEXCOORD3;
    nointerpolation float vRatio : TEXCOORD4;
    float4 gl_Position : SV_Position;
};

float2 fetchUV(int uvLookupIndex)
{
    uint vertexID = uint(gl_VertexIndex) % 4u;
    float4 uvCoords = uvLookup.Load(uvLookupIndex);
    return uvCoords.xy + (float2(float(vertexID / 2u), float(vertexID % 2u)) * uvCoords.zw);
}

void vert_main()
{
    gl_Position = mul(float4(position, 1.0f), _59_projection);
    int param = int(ratioAndIndex.y);
    vUV1 = fetchUV(param);
    int param_1 = int(extra >> uint(8));
    vUV2 = fetchUV(param_1);
    vTint = tint;
    vExtra = extra & 255u;
    vRatio = ratioAndIndex.x;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    position = stage_input.position;
    ratioAndIndex = stage_input.ratioAndIndex;
    extra = stage_input.extra;
    tint = stage_input.tint;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV1 = vUV1;
    stage_output.vUV2 = vUV2;
    stage_output.vTint = vTint;
    stage_output.vExtra = vExtra;
    stage_output.vRatio = vRatio;
    return stage_output;
}
