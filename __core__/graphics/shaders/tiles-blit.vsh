cbuffer vsConstants : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
};


static float4 gl_Position;
static float2 position;
static float2 uv;
static uint2 masks;
static float4 color;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    uint2 masks : TEXCOORD2;
    float4 color : TEXCOORD3;
};

struct SPIRV_Cross_Output
{
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 0.0f, 1.0f), _19_projection);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    position = stage_input.position;
    uv = stage_input.uv;
    masks = stage_input.masks;
    color = stage_input.color;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    return stage_output;
}
