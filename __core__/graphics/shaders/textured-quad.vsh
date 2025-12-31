cbuffer TexturedQuadConstants : register(b0)
{
    row_major float4x4 _14_projection : packoffset(c0);
    float2 _14_destPosition : packoffset(c4);
    float2 _14_size : packoffset(c4.z);
    float2 _14_center : packoffset(c5);
    float2 _14_scale : packoffset(c5.z);
    float _14_angle : packoffset(c6);
};


static float4 gl_Position;
static float3 inPosition;
static float2 vUV;
static float2 uv;

struct SPIRV_Cross_Input
{
    float3 inPosition : TEXCOORD0;
    float2 uv : TEXCOORD1;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    float2 vX = float2(cos(_14_angle), -sin(_14_angle));
    float2 vY = float2(sin(_14_angle), cos(_14_angle));
    float2 position = ((inPosition.xy * 0.5f) * _14_size) * _14_scale;
    position = float2(dot(vX, position), dot(vY, position)) + ((_14_size * 0.5f) * _14_scale);
    position = (_14_destPosition - (_14_center * _14_scale)) + position;
    gl_Position = mul(float4(position, inPosition.z, 1.0f), _14_projection);
    vUV = uv;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    inPosition = stage_input.inPosition;
    uv = stage_input.uv;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    return stage_output;
}
