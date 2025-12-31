cbuffer vsConstants : register(b0)
{
    row_major float4x4 _148_projection : packoffset(c0);
};

Texture2D<float4> tex : register(t0);
SamplerState _tex_sampler : register(s0);

static float4 gl_Position;
static int gl_VertexIndex;
static float2 srcSize;
static uint flags;
static float2 inScale;
static float inOrientation;
static float2 dstPos;
static float2 vUV;
static float2 srcPos;
static float4 vTint;
static float4 tint;
static uint vExtra;
static uint extra;

struct SPIRV_Cross_Input
{
    float2 srcPos : TEXCOORD0;
    float2 srcSize : TEXCOORD1;
    float2 dstPos : TEXCOORD2;
    float2 inScale : TEXCOORD3;
    float inOrientation : TEXCOORD4;
    float4 tint : TEXCOORD5;
    uint extra : TEXCOORD6;
    uint flags : TEXCOORD7;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float4 vTint : TEXCOORD1;
    nointerpolation uint vExtra : TEXCOORD2;
    float4 gl_Position : SV_Position;
};

uint2 spvTextureSize(Texture2D<float4> Tex, uint Level, out uint Param)
{
    uint2 ret;
    Tex.GetDimensions(Level, ret.x, ret.y, Param);
    return ret;
}

void vert_main()
{
    uint _19_dummy_parameter;
    float2 texSize = float2(int2(spvTextureSize(tex, uint(0), _19_dummy_parameter)));
    uint vertexID = uint(gl_VertexIndex) % 4u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 corner = float2(float(i), float(j));
    float2 center = srcSize * 0.5f;
    float _59;
    if ((flags & 256u) != 0u)
    {
        _59 = -inScale.x;
    }
    else
    {
        _59 = inScale.x;
    }
    float _75;
    if ((flags & 512u) != 0u)
    {
        _75 = -inScale.y;
    }
    else
    {
        _75 = inScale.y;
    }
    float2 scale = float2(_59, _75);
    float2 c = (-center) * scale;
    float2 d = srcSize * scale;
    float angle = inOrientation * 6.283185482025146484375f;
    float sinA = sin(angle);
    float cosA = cos(angle);
    float2 pos = c + (d * corner);
    float x = ((cosA * pos.x) - (sinA * pos.y)) + dstPos.x;
    float y = ((sinA * pos.x) + (cosA * pos.y)) + dstPos.y;
    gl_Position = mul(float4(x, y, 0.0f, 1.0f), _148_projection);
    vUV = (srcPos + (corner * srcSize)) / texSize;
    float4 _176;
    if ((flags & 65536u) != 0u)
    {
        _176 = float4(0.0f, 0.0f, 0.0f, tint.w);
    }
    else
    {
        _176 = tint;
    }
    vTint = _176;
    vExtra = flags & 255u;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    srcSize = stage_input.srcSize;
    flags = stage_input.flags;
    inScale = stage_input.inScale;
    inOrientation = stage_input.inOrientation;
    dstPos = stage_input.dstPos;
    srcPos = stage_input.srcPos;
    tint = stage_input.tint;
    extra = stage_input.extra;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.vTint = vTint;
    stage_output.vExtra = vExtra;
    return stage_output;
}
