cbuffer FogChunkedVertexUniforms : register(b0)
{
    row_major float4x4 ub_projection : packoffset(c0);
    float2 ub_gridTopLeftCellID : packoffset(c4);
    float2 ub_gridOffset : packoffset(c4.z);
    float2 ub_gridSize : packoffset(c5);
    float2 ub_seed : packoffset(c5.z);
    float2 ub_cellBaseVector0 : packoffset(c6);
    float2 ub_cellBaseVector1 : packoffset(c6.z);
    uint4 ub_chunkData[32] : packoffset(c7);
};


static float4 gl_Position;
static int gl_VertexIndex;
static float4 vCornerIntensities;
static float4x4 vCubicCoeffs;
static float2 vCellUV;
static float3 vColor;

struct SPIRV_Cross_Input
{
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vCellUV : TEXCOORD0;
    nointerpolation float3 vColor : TEXCOORD1;
    nointerpolation float4 vCornerIntensities : TEXCOORD2;
    nointerpolation float4x4 vCubicCoeffs : TEXCOORD3;
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

float3 random3(float2 st)
{
    float3 s = float3(dot(st, float2(12.345600128173828125f, 34.141498565673828125f)), dot(st, float2(42.21540069580078125f, 15.285400390625f)), dot(st.yx, float2(29.869800567626953125f, 49.426898956298828125f)));
    return frac(sin(s) * 45678.8984375f);
}

float fetchChunkValue(inout float2 chunk)
{
    chunk += 2.0f.xx;
    float chunkDataRowWidth = ub_gridSize.x + 4.0f;
    float fIndex = chunk.x + (chunk.y * chunkDataRowWidth);
    int index = int(fIndex);
    int groupIndex = (index >> 4) & 511;
    int elemIndex = (index & 15) >> 2;
    int byteIndex = index & 3;
    return float((ub_chunkData[groupIndex][elemIndex] >> uint(byteIndex * 8)) & 255u) / 255.0f;
}

float4 getCornerValues(float2 cellXY)
{
    float2 param = cellXY + (-1.0f).xx;
    float _135 = fetchChunkValue(param);
    float2 param_1 = cellXY + float2(0.0f, -1.0f);
    float _141 = fetchChunkValue(param_1);
    float2 param_2 = cellXY + float2(-1.0f, 0.0f);
    float _146 = fetchChunkValue(param_2);
    float2 param_3 = cellXY + 0.0f.xx;
    float _151 = fetchChunkValue(param_3);
    return float4(_135, _141, _146, _151);
}

float4 CubicHermiteCoeefs(float A, float B, float C, float D)
{
    float a = ((((-A) / 2.0f) + ((3.0f * B) / 2.0f)) - ((3.0f * C) / 2.0f)) + (D / 2.0f);
    float b = ((A - ((5.0f * B) / 2.0f)) + (2.0f * C)) - (D / 2.0f);
    float c = ((-A) / 2.0f) + (C / 2.0f);
    float d = B;
    return float4(a, b, c, d);
}

float4 getRowCubicCoeffs(float2 cellXY, float row)
{
    float2 param = cellXY + float2(-2.0f, row);
    float _208 = fetchChunkValue(param);
    float2 param_1 = cellXY + float2(-1.0f, row);
    float _214 = fetchChunkValue(param_1);
    float2 param_2 = cellXY + float2(0.0f, row);
    float _220 = fetchChunkValue(param_2);
    float2 param_3 = cellXY + float2(1.0f, row);
    float _227 = fetchChunkValue(param_3);
    float4 r = float4(_208, _214, _220, _227);
    float param_4 = r.x;
    float param_5 = r.y;
    float param_6 = r.z;
    float param_7 = r.w;
    return CubicHermiteCoeefs(param_4, param_5, param_6, param_7);
}

void calculateChunkParams()
{
    float quadID = float(uint(gl_VertexIndex) / 4u);
    uint vertexID = uint(gl_VertexIndex) % 4u;
    float cellIndex = quadID;
    float yCell = floor((cellIndex + 0.5f) / ub_gridSize.x);
    float xCell = cellIndex - (yCell * ub_gridSize.x);
    float2 cellID = float2(xCell, yCell);
    float2 cellSeed = mod(ub_gridTopLeftCellID + cellID, 8192.0f.xx) + ub_seed;
    float2 param = cellSeed;
    float3 cellColor = random3(param);
    float2 corner = float2(float(vertexID % 2u), float(vertexID / 2u));
    float2 position = (ub_gridOffset + (ub_cellBaseVector0 * (xCell + corner.x))) + (ub_cellBaseVector1 * (yCell + corner.y));
    float2 param_1 = cellID;
    vCornerIntensities = getCornerValues(param_1);
    float2 param_2 = cellID;
    float param_3 = -2.0f;
    float2 param_4 = cellID;
    float param_5 = -1.0f;
    float2 param_6 = cellID;
    float param_7 = 0.0f;
    float2 param_8 = cellID;
    float param_9 = 1.0f;
    vCubicCoeffs = float4x4(float4(getRowCubicCoeffs(param_2, param_3)), float4(getRowCubicCoeffs(param_4, param_5)), float4(getRowCubicCoeffs(param_6, param_7)), float4(getRowCubicCoeffs(param_8, param_9)));
    vCellUV = corner;
    vColor = cellColor;
    gl_Position = mul(float4(position, 0.0f, 1.0f), ub_projection);
}

void vert_main()
{
    calculateChunkParams();
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vCornerIntensities = vCornerIntensities;
    stage_output.vCubicCoeffs = vCubicCoeffs;
    stage_output.vCellUV = vCellUV;
    stage_output.vColor = vColor;
    return stage_output;
}
