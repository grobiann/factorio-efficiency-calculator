cbuffer vsConstants : register(b0)
{
    row_major float4x4 _19_projection : packoffset(c0);
};


static float4 gl_Position;
static float2 position;
static float2 vUV;
static float2 uv;
static float vOpacity;
static float4 tint;
static uint vExtra;
static uint extra;
static float vFalloff;
static uint2 uData;
static float4 fData;
static float2 vRectSize;
static float2 vRelativePosition;

struct SPIRV_Cross_Input
{
    float2 position : TEXCOORD0;
    float2 uv : TEXCOORD1;
    float4 tint : TEXCOORD2;
    uint extra : TEXCOORD3;
    uint2 uData : TEXCOORD4;
    float4 fData : TEXCOORD5;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    float vOpacity : TEXCOORD1;
    nointerpolation uint vExtra : TEXCOORD2;
    nointerpolation float vFalloff : TEXCOORD3;
    float2 vRelativePosition : TEXCOORD4;
    nointerpolation float2 vRectSize : TEXCOORD5;
    float4 gl_Position : SV_Position;
};

void vert_main()
{
    gl_Position = mul(float4(position, 0.0f, 1.0f), _19_projection);
    vUV = uv;
    vOpacity = tint.w;
    vExtra = extra;
    vFalloff = asfloat(uData.x);
    float2 rectLeftTop = fData.xy;
    float2 rectRightBottom = fData.zw;
    vRectSize = abs(rectRightBottom - rectLeftTop) * 0.5f;
    vRelativePosition = position - ((rectLeftTop * 0.5f) + (rectRightBottom * 0.5f));
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    position = stage_input.position;
    uv = stage_input.uv;
    tint = stage_input.tint;
    extra = stage_input.extra;
    uData = stage_input.uData;
    fData = stage_input.fData;
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.vOpacity = vOpacity;
    stage_output.vExtra = vExtra;
    stage_output.vFalloff = vFalloff;
    stage_output.vRectSize = vRectSize;
    stage_output.vRelativePosition = vRelativePosition;
    return stage_output;
}
