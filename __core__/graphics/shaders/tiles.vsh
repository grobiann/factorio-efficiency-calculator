cbuffer vsConstants : register(b0)
{
    row_major float4x4 _215_projection : packoffset(c0);
};

Buffer<float4> maskTexCoordTable : register(t0);

static float4 gl_Position;
static int gl_VertexIndex;
static uint vFlags;
static uint flags;
static float4 maskUVs;
static uint2 masks;
static float3 vTint;
static float2 vUV;
static float2 uv;
static float2 position;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    uint2 masks : TEXCOORD2;
    uint flags : TEXCOORD3;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float4 maskUVs : TEXCOORD1;
    nointerpolation uint vFlags : TEXCOORD2;
    float3 vTint : TEXCOORD3;
    float4 gl_Position : SV_Position;
};

float2 getMaskUV(Buffer<float4> coordTable, float2 corner, uint maskIndex)
{
    float4 mask = coordTable.Load(int(maskIndex));
    return mask.xy + (corner * mask.zw);
}

float decodeTimeScale(uint val)
{
    float magic = asfloat(2004877312u);
    float f = asfloat(((val >> uint(4)) & 1023u) << uint(18));
    return f * magic;
}

float decodeDistanceFieldVariation(uint val)
{
    return 87.5f + (float(val & 15u) * 0.78125f);
}

float4 getMaskUVs(Buffer<float4> coordTable, uint2 masks_1)
{
    uint vertexID = uint(gl_VertexIndex) & 3u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    float2 corner = float2(float(i), float(j));
    float2 param = corner;
    uint param_1 = masks_1.x;
    float2 mask1 = getMaskUV(coordTable, param, param_1);
    uint _145;
    if (masks_1.y >= 32768u)
    {
        _145 = 0u;
    }
    else
    {
        _145 = masks_1.y;
    }
    float2 param_2 = corner;
    uint param_3 = _145;
    float2 mask2 = getMaskUV(coordTable, param_2, param_3);
    if (masks_1.y >= 32768u)
    {
        uint param_4 = masks_1.y;
        uint param_5 = masks_1.y;
        mask2 = float2((-2.0f) - decodeTimeScale(param_4), decodeDistanceFieldVariation(param_5));
    }
    return float4(mask1, mask2);
}

float3 unpackRGB565(int rgb5)
{
    return float3(rgb5.xxx & int3(63488, 2016, 31));
}

float3 decodeRGB565(int rgb5)
{
    int param = rgb5;
    return unpackRGB565(param) * float3(1.5751007595099508762359619140625e-05f, 0.0004960317746736109256744384765625f, 0.0322580635547637939453125f);
}

void vert_main()
{
    vFlags = flags;
    uint2 param = masks;
    maskUVs = getMaskUVs(maskTexCoordTable, param);
    int param_1 = int(flags >> uint(16));
    vTint = decodeRGB565(param_1);
    vUV = uv;
    gl_Position = mul(float4(position, 0.0f, 1.0f), _215_projection);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    flags = stage_input.flags;
    masks = stage_input.masks;
    uv = stage_input.uv;
    position = stage_input.position;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vFlags = vFlags;
    stage_output.maskUVs = maskUVs;
    stage_output.vTint = vTint;
    stage_output.vUV = vUV;
    return stage_output;
}
