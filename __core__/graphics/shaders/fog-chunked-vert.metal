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

struct FogChunkedVertexUniforms
{
    float4x4 projection;
    float2 gridTopLeftCellID;
    float2 gridOffset;
    float2 gridSize;
    float2 seed;
    float2 cellBaseVector0;
    float2 cellBaseVector1;
    uint4 chunkData[32];
};

struct main0_out
{
    float2 vCellUV [[user(locn0)]];
    float3 vColor [[user(locn1)]];
    float4 vCornerIntensities [[user(locn2)]];
    float4 vCubicCoeffs_0 [[user(locn3)]];
    float4 vCubicCoeffs_1 [[user(locn4)]];
    float4 vCubicCoeffs_2 [[user(locn5)]];
    float4 vCubicCoeffs_3 [[user(locn6)]];
    float4 gl_Position [[position]];
};

static inline __attribute__((always_inline))
float3 random3(thread const float2& st)
{
    float3 s = float3(dot(st, float2(12.345600128173828125, 34.141498565673828125)), dot(st, float2(42.21540069580078125, 15.285400390625)), dot(st.yx, float2(29.869800567626953125, 49.426898956298828125)));
    return fract(sin(s) * 45678.8984375);
}

static inline __attribute__((always_inline))
float fetchChunkValue(thread float2& chunk, constant FogChunkedVertexUniforms& ub)
{
    chunk += float2(2.0);
    float chunkDataRowWidth = ub.gridSize.x + 4.0;
    float fIndex = chunk.x + (chunk.y * chunkDataRowWidth);
    int index = int(fIndex);
    int groupIndex = (index >> 4) & 511;
    int elemIndex = (index & 15) >> 2;
    int byteIndex = index & 3;
    return float((ub.chunkData[groupIndex][elemIndex] >> uint(byteIndex * 8)) & 255u) / 255.0;
}

static inline __attribute__((always_inline))
float4 getCornerValues(thread const float2& cellXY, constant FogChunkedVertexUniforms& ub)
{
    float2 param = cellXY + float2(-1.0);
    float _135 = fetchChunkValue(param, ub);
    float2 param_1 = cellXY + float2(0.0, -1.0);
    float _141 = fetchChunkValue(param_1, ub);
    float2 param_2 = cellXY + float2(-1.0, 0.0);
    float _146 = fetchChunkValue(param_2, ub);
    float2 param_3 = cellXY + float2(0.0);
    float _151 = fetchChunkValue(param_3, ub);
    return float4(_135, _141, _146, _151);
}

static inline __attribute__((always_inline))
float4 CubicHermiteCoeefs(thread const float& A, thread const float& B, thread const float& C, thread const float& D)
{
    float a = ((((-A) / 2.0) + ((3.0 * B) / 2.0)) - ((3.0 * C) / 2.0)) + (D / 2.0);
    float b = ((A - ((5.0 * B) / 2.0)) + (2.0 * C)) - (D / 2.0);
    float c = ((-A) / 2.0) + (C / 2.0);
    float d = B;
    return float4(a, b, c, d);
}

static inline __attribute__((always_inline))
float4 getRowCubicCoeffs(thread const float2& cellXY, thread const float& row, constant FogChunkedVertexUniforms& ub)
{
    float2 param = cellXY + float2(-2.0, row);
    float _208 = fetchChunkValue(param, ub);
    float2 param_1 = cellXY + float2(-1.0, row);
    float _214 = fetchChunkValue(param_1, ub);
    float2 param_2 = cellXY + float2(0.0, row);
    float _220 = fetchChunkValue(param_2, ub);
    float2 param_3 = cellXY + float2(1.0, row);
    float _227 = fetchChunkValue(param_3, ub);
    float4 r = float4(_208, _214, _220, _227);
    float param_4 = r.x;
    float param_5 = r.y;
    float param_6 = r.z;
    float param_7 = r.w;
    return CubicHermiteCoeefs(param_4, param_5, param_6, param_7);
}

static inline __attribute__((always_inline))
void calculateChunkParams(constant FogChunkedVertexUniforms& ub, thread uint& gl_VertexIndex, thread float4& vCornerIntensities, thread float4x4& vCubicCoeffs, thread float2& vCellUV, thread float3& vColor, thread float4& gl_Position)
{
    float quadID = float(uint(int(gl_VertexIndex)) / 4u);
    uint vertexID = uint(int(gl_VertexIndex)) % 4u;
    float cellIndex = quadID;
    float yCell = floor((cellIndex + 0.5) / ub.gridSize.x);
    float xCell = cellIndex - (yCell * ub.gridSize.x);
    float2 cellID = float2(xCell, yCell);
    float2 cellSeed = mod(ub.gridTopLeftCellID + cellID, float2(8192.0)) + ub.seed;
    float2 param = cellSeed;
    float3 cellColor = random3(param);
    float2 corner = float2(float(vertexID % 2u), float(vertexID / 2u));
    float2 position = (ub.gridOffset + (ub.cellBaseVector0 * (xCell + corner.x))) + (ub.cellBaseVector1 * (yCell + corner.y));
    float2 param_1 = cellID;
    vCornerIntensities = getCornerValues(param_1, ub);
    float2 param_2 = cellID;
    float param_3 = -2.0;
    float2 param_4 = cellID;
    float param_5 = -1.0;
    float2 param_6 = cellID;
    float param_7 = 0.0;
    float2 param_8 = cellID;
    float param_9 = 1.0;
    vCubicCoeffs = float4x4(float4(getRowCubicCoeffs(param_2, param_3, ub)), float4(getRowCubicCoeffs(param_4, param_5, ub)), float4(getRowCubicCoeffs(param_6, param_7, ub)), float4(getRowCubicCoeffs(param_8, param_9, ub)));
    vCellUV = corner;
    vColor = cellColor;
    gl_Position = ub.projection * float4(position, 0.0, 1.0);
}

vertex main0_out main0(constant FogChunkedVertexUniforms& ub [[buffer(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    float4x4 vCubicCoeffs = {};
    calculateChunkParams(ub, gl_VertexIndex, out.vCornerIntensities, vCubicCoeffs, out.vCellUV, out.vColor, out.gl_Position);
    out.vCubicCoeffs_0 = vCubicCoeffs[0];
    out.vCubicCoeffs_1 = vCubicCoeffs[1];
    out.vCubicCoeffs_2 = vCubicCoeffs[2];
    out.vCubicCoeffs_3 = vCubicCoeffs[3];
    return out;
}

