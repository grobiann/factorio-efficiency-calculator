cbuffer vsConstants : register(b0)
{
    row_major float4x4 _176_projection : packoffset(c0);
};

Buffer<float4> maskTexCoordTable : register(t0);

static float4 gl_Position;
static int gl_VertexIndex;
static float4 vColor;
static float4 color;
static float2 vUV;
static float2 uv;
static float4 maskUVs;
static uint2 masks;
static float2 position;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    uint2 masks : TEXCOORD2;
    float4 color : TEXCOORD3;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float4 vColor : TEXCOORD1;
    float4 maskUVs : TEXCOORD2;
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
    uint _115;
    if (masks_1.y >= 32768u)
    {
        _115 = 0u;
    }
    else
    {
        _115 = masks_1.y;
    }
    float2 param_2 = corner;
    uint param_3 = _115;
    float2 mask2 = getMaskUV(coordTable, param_2, param_3);
    if (masks_1.y >= 32768u)
    {
        uint param_4 = masks_1.y;
        uint param_5 = masks_1.y;
        mask2 = float2((-2.0f) - decodeTimeScale(param_4), decodeDistanceFieldVariation(param_5));
    }
    return float4(mask1, mask2);
}

void vert_main()
{
    vColor = color;
    vUV = uv;
    uint2 param = masks;
    maskUVs = getMaskUVs(maskTexCoordTable, param);
    gl_Position = mul(float4(position, 0.0f, 1.0f), _176_projection);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    color = stage_input.color;
    uv = stage_input.uv;
    masks = stage_input.masks;
    position = stage_input.position;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vColor = vColor;
    stage_output.vUV = vUV;
    stage_output.maskUVs = maskUVs;
    return stage_output;
}
