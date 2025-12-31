cbuffer vsConstants : register(b0)
{
    row_major float4x4 _24_projection : packoffset(c0);
};


static float4 gl_Position;
static float4 vColor;
static float4 color;
static float2 position;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float4 color : TEXCOORD3;
};

struct SPIRV_Cross_Output
{
    float4 vColor : TEXCOORD0;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    vColor = color;
    gl_Position = mul(float4(position, 0.0f, 1.0f), _24_projection);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    color = stage_input.color;
    position = stage_input.position;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vColor = vColor;
    return stage_output;
}
