cbuffer vsConstants : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
};


static float4 gl_Position;
static float3 position;
static float2 vDiffuseUV;
static float2 diffuseUV;
static float2 vNormalUV;
static float2 normalUV;
static float2 vRoughnessUV;
static float2 roughnessUV;
static float vAngle;
static float angle;
static float vOpacity;
static float opacity;

struct SPIRV_Cross_Input
{
    float3 position : TEXCOORD0;
    float2 diffuseUV : TEXCOORD1;
    float2 normalUV : TEXCOORD2;
    float2 roughnessUV : TEXCOORD3;
    float angle : TEXCOORD4;
    float opacity : TEXCOORD5;
};

struct SPIRV_Cross_Output
{
    float2 vDiffuseUV : TEXCOORD0;
    float2 vNormalUV : TEXCOORD1;
    float2 vRoughnessUV : TEXCOORD2;
    nointerpolation float vAngle : TEXCOORD3;
    nointerpolation float vOpacity : TEXCOORD4;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 1.0f), _19_projection);
    vDiffuseUV = diffuseUV;
    vNormalUV = normalUV;
    vRoughnessUV = roughnessUV;
    vAngle = angle;
    vOpacity = opacity;
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    position = stage_input.position;
    diffuseUV = stage_input.diffuseUV;
    normalUV = stage_input.normalUV;
    roughnessUV = stage_input.roughnessUV;
    angle = stage_input.angle;
    opacity = stage_input.opacity;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vDiffuseUV = vDiffuseUV;
    stage_output.vNormalUV = vNormalUV;
    stage_output.vRoughnessUV = vRoughnessUV;
    stage_output.vAngle = vAngle;
    stage_output.vOpacity = vOpacity;
    return stage_output;
}
