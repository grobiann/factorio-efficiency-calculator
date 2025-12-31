cbuffer LightningProperties : register(b0)
{
    row_major float4x4 _19_mvp : packoffset(c0);
    float4 _19_initialColor : packoffset(c4);
    float _19_distortion : packoffset(c5);
    float _19_initialThickness : packoffset(c5.y);
    float _19_power : packoffset(c5.z);
    float _19_time : packoffset(c5.w);
};


static float4 gl_Position;
static float2 position;
static float2 vPosition;
static float2 vUV;
static float2 uv;
static float vIntensity;
static float intensity;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    float intensity : TEXCOORD2;
};

struct SPIRV_Cross_Output
{
    float2 vPosition : TEXCOORD0;
    float2 vUV : TEXCOORD1;
    float vIntensity : TEXCOORD2;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 0.0f, 1.0f), _19_mvp);
    vPosition = position;
    vUV = uv;
    vIntensity = intensity;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    position = stage_input.position;
    uv = stage_input.uv;
    intensity = stage_input.intensity;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vPosition = vPosition;
    stage_output.vUV = vUV;
    stage_output.vIntensity = vIntensity;
    return stage_output;
}
