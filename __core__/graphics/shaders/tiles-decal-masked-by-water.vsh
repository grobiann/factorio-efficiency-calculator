cbuffer vsConstants : register(b0)
{
    row_major float4x4 _68_projection : packoffset(c0);
};


static float4 gl_Position;
static uint vFlags;
static uint flags;
static float3 vTint;
static float2 vUV;
static float2 uv;
static float2 position;
static uint2 masks;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    uint2 masks : TEXCOORD2;
    uint flags : TEXCOORD3;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    nointerpolation uint vFlags : TEXCOORD1;
    float3 vTint : TEXCOORD2;
    float4 gl_Position : SV_Position;
};

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
    int param = int(flags >> uint(16));
    vTint = decodeRGB565(param);
    vUV = uv;
    gl_Position = mul(float4(position, 0.0f, 1.0f), _68_projection);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    flags = stage_input.flags;
    uv = stage_input.uv;
    position = stage_input.position;
    masks = stage_input.masks;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vFlags = vFlags;
    stage_output.vTint = vTint;
    stage_output.vUV = vUV;
    return stage_output;
}
