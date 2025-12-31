#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

// Implementation of the GLSL mod() function, which is slightly different than Metal fmod()
template<typename Tx, typename Ty>
inline Tx mod(Tx x, Ty y)
{
    return x - y * floor(x / y);
}

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

struct ParallaxLayerDef_1
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

struct StarfieldConstants
{
    float4x4 projection;
    float2 resolution;
    float2 backgroundOffset;
    float time;
    float timeRaw;
    float zoom;
    float starsPerCell;
    float starBrightness;
    float starShape;
    float starSaturation;
    int parallaxLayerCount;
    ParallaxLayerDef_1 layers[4];
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float3 vColor [[user(locn1)]];
    float4 gl_Position [[position]];
};

static inline __attribute__((always_inline))
float2 random2(thread const float2& st)
{
    float2 s = float2(dot(st, float2(12.345600128173828125, 34.141498565673828125)), dot(st, float2(42.21540069580078125, 15.285400390625)));
    return fract(sin(s) * 45678.8984375);
}

static inline __attribute__((always_inline))
float3 random3(thread const float2& st)
{
    float3 s = float3(dot(st, float2(12.345600128173828125, 34.141498565673828125)), dot(st, float2(42.21540069580078125, 15.285400390625)), dot(st.yx, float2(29.869800567626953125, 49.426898956298828125)));
    return fract(sin(s) * 45678.8984375);
}

static inline __attribute__((always_inline))
bool ok_color(thread const float3& color)
{
    float max_v = fast::max(fast::max(color.x, color.y), color.z);
    float min_v = fast::min(fast::min(color.x, color.y), color.z);
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

static inline __attribute__((always_inline))
void calculateStarParams(thread const ParallaxLayerDef& p, thread uint& gl_VertexIndex, constant StarfieldConstants& ub, thread float2& vUV, thread float3& vColor, thread float4& gl_Position)
{
    float quadID = float(uint(int(gl_VertexIndex)) / 4u) - float(p.beginQuadID);
    uint vertexID = uint(int(gl_VertexIndex)) % 4u;
    float cellID = floor((quadID + 0.5) / ub.starsPerCell);
    float starID = quadID - (cellID * ub.starsPerCell);
    float yCell = floor((cellID + 0.5) / p.gridSize.x);
    float xCell = cellID - (yCell * p.gridSize.x);
    float2 cellOffset = (p.gridOffset + (p.cellBaseVector0 * xCell)) + (p.cellBaseVector1 * yCell);
    float2 starSeed = mod(p.gridTopLeftCellID + float2(xCell, yCell), float2(8192.0)) + (p.seed * starID);
    float2 param = starSeed;
    float2 starOffset = random2(param);
    starSeed += starOffset;
    float2 param_1 = starSeed;
    float3 starColor = random3(param_1);
    float2 starPos = ((p.cellBaseVector0 * starOffset.x) + (p.cellBaseVector1 * starOffset.y)) + cellOffset;
    float2 corner = float2(float(vertexID % 2u), float(vertexID / 2u));
    float2 position = starPos + ((corner - float2(0.5)) * p.starSize);
    vUV = (corner - float2(0.5)) * 2.0;
    vColor = starColor;
    gl_Position = ub.projection * float4(position, 0.0, 1.0);
    float3 param_2 = starColor;
    if (!ok_color(param_2))
    {
        gl_Position = float4(-777.0, -777.0, 0.0, 1.0);
    }
}

vertex main0_out main0(constant StarfieldConstants& ub [[buffer(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    uint quadID = uint(int(gl_VertexIndex)) / 4u;
    int parallaxLayer = 0;
    for (;;)
    {
        bool _309 = parallaxLayer < (min(4, ub.parallaxLayerCount) - 1);
        bool _319;
        if (_309)
        {
            _319 = quadID >= ub.layers[parallaxLayer].endQuadID;
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
    param.beginQuadID = ub.layers[parallaxLayer].beginQuadID;
    param.endQuadID = ub.layers[parallaxLayer].endQuadID;
    param.seed = ub.layers[parallaxLayer].seed;
    param.gridTopLeftCellID = ub.layers[parallaxLayer].gridTopLeftCellID;
    param.gridOffset = ub.layers[parallaxLayer].gridOffset;
    param.gridSize = ub.layers[parallaxLayer].gridSize;
    param.starSize = ub.layers[parallaxLayer].starSize;
    param.cellBaseVector0 = ub.layers[parallaxLayer].cellBaseVector0;
    param.cellBaseVector1 = ub.layers[parallaxLayer].cellBaseVector1;
    calculateStarParams(param, gl_VertexIndex, ub, out.vUV, out.vColor, out.gl_Position);
    return out;
}

