cbuffer vsConstants : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
};


static float4 gl_Position;
static int gl_VertexIndex;
static float3 position;
static float2 vUV;
static float2 uv;
static float2 vRawUV;
static float4 vTint;
static float4 tint;
static uint extra;
static float4 vPos;
static float4 vWorld;

struct SPIRV_Cross_Input
{
    float3 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    float4 tint : TEXCOORD2;
    uint extra : TEXCOORD3;
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float2 vRawUV : TEXCOORD1;
    float4 vTint : TEXCOORD2;
    float4 vPos : TEXCOORD3;
    float4 vWorld : TEXCOORD4;
    float4 gl_Position : SV_Position;
};

float mod(float x, float y)
{
    return x - y * floor(x / y);
}

float2 mod(float2 x, float2 y)
{
    return x - y * floor(x / y);
}

float3 mod(float3 x, float3 y)
{
    return x - y * floor(x / y);
}

float4 mod(float4 x, float4 y)
{
    return x - y * floor(x / y);
}

void vert_main()
{
    gl_Position = mul(float4(position, 1.0f), _19_projection);
    vUV = uv;
    vRawUV = float2(float(mod(float(gl_VertexIndex), 4.0f) > 1.0f), mod(float(gl_VertexIndex), 2.0f));
    vTint = tint;
    uint world_x_sign = (extra >> uint(15)) & 1u;
    uint world_y_sign = (extra >> uint(31)) & 1u;
    uint world_x_num = (extra >> uint(0)) & 32767u;
    uint world_y_num = (extra >> uint(16)) & 32767u;
    float _89;
    if (world_x_sign > 0u)
    {
        _89 = -float(world_x_num ^ 32767u);
    }
    else
    {
        _89 = float(world_x_num);
    }
    float world_x = _89;
    float _103;
    if (world_y_sign > 0u)
    {
        _103 = -float(world_y_num ^ 32767u);
    }
    else
    {
        _103 = float(world_y_num);
    }
    float world_y = _103;
    vPos = float4(position, 1.0f);
    vWorld = float4(float2(world_x, world_y), 1.0f, 1.0f);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    position = stage_input.position;
    uv = stage_input.uv;
    tint = stage_input.tint;
    extra = stage_input.extra;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.vRawUV = vRawUV;
    stage_output.vTint = vTint;
    stage_output.vPos = vPos;
    stage_output.vWorld = vWorld;
    return stage_output;
}
