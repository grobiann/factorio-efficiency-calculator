struct SpriteMask
{
    row_major float4x4 uvTransform;
    float2 uvMin;
    float2 uvMax;
    uint tint;
    uint extraData;
    float2 padding_;
};

cbuffer spriteMaskUniforms : register(b1)
{
    float4 _19_vertices[4] : packoffset(c0);
    uint _19_tint : packoffset(c4);
    uint _19_extraData : packoffset(c4.y);
    uint _19_numMasks : packoffset(c4.z);
    float _19_padding_ : packoffset(c4.w);
    SpriteMask _19_masks[4] : packoffset(c5);
};

cbuffer vsConstants : register(b0)
{
    row_major float4x4 _37_projection : packoffset(c0);
};


static float4 gl_Position;
static int gl_VertexIndex;
static float2 vUV;
static float4 vTint;
static uint vExtra;
static float2 vMask0UV;
static float2 vMask1UV;
static float2 vMask2UV;
static float2 vMask3UV;
static float3 inPosition;
static float2 uv;

struct SPIRV_Cross_Input
{
    float3 inPosition : TEXCOORD0;
    float2 uv : TEXCOORD1;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float4 vTint : TEXCOORD1;
    nointerpolation uint vExtra : TEXCOORD2;
    float2 vMask0UV : TEXCOORD3;
    float2 vMask1UV : TEXCOORD4;
    float2 vMask2UV : TEXCOORD5;
    float2 vMask3UV : TEXCOORD6;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    float4 vert = _19_vertices[gl_VertexIndex & 3];
    gl_Position = mul(float4(vert.xy, 0.0f, 1.0f), _37_projection);
    vUV = vert.zw;
    vTint = float4(float((_19_tint >> uint(0)) & 255u), float((_19_tint >> uint(8)) & 255u), float((_19_tint >> uint(16)) & 255u), float((_19_tint >> uint(24)) & 255u)) / 255.0f.xxxx;
    vExtra = _19_extraData;
    vMask0UV = mul(float4(vUV, 0.0f, 1.0f), _19_masks[0].uvTransform).xy;
    vMask1UV = mul(float4(vUV, 0.0f, 1.0f), _19_masks[1].uvTransform).xy;
    vMask2UV = mul(float4(vUV, 0.0f, 1.0f), _19_masks[2].uvTransform).xy;
    vMask3UV = mul(float4(vUV, 0.0f, 1.0f), _19_masks[3].uvTransform).xy;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    inPosition = stage_input.inPosition;
    uv = stage_input.uv;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.vTint = vTint;
    stage_output.vExtra = vExtra;
    stage_output.vMask0UV = vMask0UV;
    stage_output.vMask1UV = vMask1UV;
    stage_output.vMask2UV = vMask2UV;
    stage_output.vMask3UV = vMask3UV;
    return stage_output;
}
