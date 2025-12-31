struct ParallaxLayerDef
{
    uint beginQuadID;
    uint endQuadID;
    float2 seed;
    float2 gridTopLeftCellID;
    float2 gridOffset;
    float2 gridSize;
    float2 starSize;
    float2 cellBaseVector0;
    float2 cellBaseVector1;
};

cbuffer StarfieldConstants : register(b0)
{
    row_major float4x4 ub_projection : packoffset(c0);
    float2 ub_resolution : packoffset(c4);
    float2 ub_backgroundOffset : packoffset(c4.z);
    float ub_time : packoffset(c5);
    float ub_timeRaw : packoffset(c5.y);
    float ub_zoom : packoffset(c5.z);
    float ub_starsPerCell : packoffset(c5.w);
    float ub_starBrightness : packoffset(c6);
    float ub_starShape : packoffset(c6.y);
    float ub_starSaturation : packoffset(c6.z);
    int ub_parallaxLayerCount : packoffset(c6.w);
    ParallaxLayerDef ub_layers[4] : packoffset(c7);
};


static float4 gl_Position;
static int gl_VertexIndex;
static float2 vUV;
static float3 vColor;

struct SPIRV_Cross_Input
{
    uint gl_VertexIndex : SV_VertexID;
};

struct SPIRV_Cross_Output
{
    float2 vUV : TEXCOORD0;
    nointerpolation float3 vColor : TEXCOORD1;
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

float2 random2(float2 st)
{
    float2 s = float2(dot(st, float2(12.345600128173828125f, 34.141498565673828125f)), dot(st, float2(42.21540069580078125f, 15.285400390625f)));
    return frac(sin(s) * 45678.8984375f);
}

float3 random3(float2 st)
{
    float3 s = float3(dot(st, float2(12.345600128173828125f, 34.141498565673828125f)), dot(st, float2(42.21540069580078125f, 15.285400390625f)), dot(st.yx, float2(29.869800567626953125f, 49.426898956298828125f)));
    return frac(sin(s) * 45678.8984375f);
}

bool ok_color(float3 color)
{
    float max_v = max(max(color.x, color.y), color.z);
    float min_v = min(min(color.x, color.y), color.z);
    if (max_v == color.x)
    {
        if (color.y < color.z)
        {
            return false;
        }
    }
    if (max_v == color.z)
    {
        if (color.x > color.y)
        {
            return false;
        }
    }
    return true;
}

void calculateStarParams(ParallaxLayerDef p)
{
    float quadID = float(uint(gl_VertexIndex) / 4u) - float(p.beginQuadID);
    uint vertexID = uint(gl_VertexIndex) % 4u;
    float cellID = floor((quadID + 0.5f) / ub_starsPerCell);
    float starID = quadID - (cellID * ub_starsPerCell);
    float yCell = floor((cellID + 0.5f) / p.gridSize.x);
    float xCell = cellID - (yCell * p.gridSize.x);
    float2 cellOffset = (p.gridOffset + (p.cellBaseVector0 * xCell)) + (p.cellBaseVector1 * yCell);
    float2 starSeed = mod(p.gridTopLeftCellID + float2(xCell, yCell), 8192.0f.xx) + (p.seed * starID);
    float2 param = starSeed;
    float2 starOffset = random2(param);
    starSeed += starOffset;
    float2 param_1 = starSeed;
    float3 starColor = random3(param_1);
    float2 starPos = ((p.cellBaseVector0 * starOffset.x) + (p.cellBaseVector1 * starOffset.y)) + cellOffset;
    float2 corner = float2(float(vertexID % 2u), float(vertexID / 2u));
    float2 position = starPos + ((corner - 0.5f.xx) * p.starSize);
    vUV = (corner - 0.5f.xx) * 2.0f;
    vColor = starColor;
    gl_Position = mul(float4(position, 0.0f, 1.0f), ub_projection);
    float3 param_2 = starColor;
    if (!ok_color(param_2))
    {
        gl_Position = float4(-777.0f, -777.0f, 0.0f, 1.0f);
    }
}

void vert_main()
{
    uint quadID = uint(gl_VertexIndex) / 4u;
    int parallaxLayer = 0;
    for (;;)
    {
        bool _309 = parallaxLayer < (min(4, ub_parallaxLayerCount) - 1);
        bool _319;
        if (_309)
        {
            _319 = quadID >= ub_layers[parallaxLayer].endQuadID;
        }
        else
        {
            _319 = _309;
        }
        if (_319)
        {
            parallaxLayer++;
            continue;
        }
        else
        {
            break;
        }
    }
    ParallaxLayerDef param;
    param.beginQuadID = ub_layers[parallaxLayer].beginQuadID;
    param.endQuadID = ub_layers[parallaxLayer].endQuadID;
    param.seed = ub_layers[parallaxLayer].seed;
    param.gridTopLeftCellID = ub_layers[parallaxLayer].gridTopLeftCellID;
    param.gridOffset = ub_layers[parallaxLayer].gridOffset;
    param.gridSize = ub_layers[parallaxLayer].gridSize;
    param.starSize = ub_layers[parallaxLayer].starSize;
    param.cellBaseVector0 = ub_layers[parallaxLayer].cellBaseVector0;
    param.cellBaseVector1 = ub_layers[parallaxLayer].cellBaseVector1;
    calculateStarParams(param);
}

SPIRV_Cross_Output main(SPIRV_Cross_Input stage_input)
{
    gl_VertexIndex = int(stage_input.gl_VertexIndex);
    vert_main();
    SPIRV_Cross_Output stage_output;
    stage_output.gl_Position = gl_Position;
    stage_output.vUV = vUV;
    stage_output.vColor = vColor;
    return stage_output;
}
