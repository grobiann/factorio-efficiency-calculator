#version 330

layout(std140) uniform FogChunkedVertexUniforms
{
    mat4 projection;
    vec2 gridTopLeftCellID;
    vec2 gridOffset;
    vec2 gridSize;
    vec2 seed;
    vec2 cellBaseVector0;
    vec2 cellBaseVector1;
    uvec4 chunkData[32];
} ub;

flat out vec4 vCornerIntensities;
flat out mat4 vCubicCoeffs;
out vec2 vCellUV;
flat out vec3 vColor;

vec3 random3(vec2 st)
{
    vec3 s = vec3(dot(st, vec2(12.345600128173828125, 34.141498565673828125)), dot(st, vec2(42.21540069580078125, 15.285400390625)), dot(st.yx, vec2(29.869800567626953125, 49.426898956298828125)));
    return fract(sin(s) * 45678.8984375);
}

float fetchChunkValue(inout vec2 chunk)
{
    chunk += vec2(2.0);
    float chunkDataRowWidth = ub.gridSize.x + 4.0;
    float fIndex = chunk.x + (chunk.y * chunkDataRowWidth);
    int index = int(fIndex);
    int groupIndex = (index >> 4) & 511;
    int elemIndex = (index & 15) >> 2;
    int byteIndex = index & 3;
    return float((ub.chunkData[groupIndex][elemIndex] >> uint(byteIndex * 8)) & 255u) / 255.0;
}

vec4 getCornerValues(vec2 cellXY)
{
    vec2 param = cellXY + vec2(-1.0);
    float _135 = fetchChunkValue(param);
    vec2 param_1 = cellXY + vec2(0.0, -1.0);
    float _141 = fetchChunkValue(param_1);
    vec2 param_2 = cellXY + vec2(-1.0, 0.0);
    float _146 = fetchChunkValue(param_2);
    vec2 param_3 = cellXY + vec2(0.0);
    float _151 = fetchChunkValue(param_3);
    return vec4(_135, _141, _146, _151);
}

vec4 CubicHermiteCoeefs(float A, float B, float C, float D)
{
    float a = ((((-A) / 2.0) + ((3.0 * B) / 2.0)) - ((3.0 * C) / 2.0)) + (D / 2.0);
    float b = ((A - ((5.0 * B) / 2.0)) + (2.0 * C)) - (D / 2.0);
    float c = ((-A) / 2.0) + (C / 2.0);
    float d = B;
    return vec4(a, b, c, d);
}

vec4 getRowCubicCoeffs(vec2 cellXY, float row)
{
    vec2 param = cellXY + vec2(-2.0, row);
    float _208 = fetchChunkValue(param);
    vec2 param_1 = cellXY + vec2(-1.0, row);
    float _214 = fetchChunkValue(param_1);
    vec2 param_2 = cellXY + vec2(0.0, row);
    float _220 = fetchChunkValue(param_2);
    vec2 param_3 = cellXY + vec2(1.0, row);
    float _227 = fetchChunkValue(param_3);
    vec4 r = vec4(_208, _214, _220, _227);
    float param_4 = r.x;
    float param_5 = r.y;
    float param_6 = r.z;
    float param_7 = r.w;
    return CubicHermiteCoeefs(param_4, param_5, param_6, param_7);
}

void calculateChunkParams()
{
    float quadID = float(uint(gl_VertexID) / 4u);
    uint vertexID = uint(gl_VertexID) % 4u;
    float cellIndex = quadID;
    float yCell = floor((cellIndex + 0.5) / ub.gridSize.x);
    float xCell = cellIndex - (yCell * ub.gridSize.x);
    vec2 cellID = vec2(xCell, yCell);
    vec2 cellSeed = mod(ub.gridTopLeftCellID + cellID, vec2(8192.0)) + ub.seed;
    vec2 param = cellSeed;
    vec3 cellColor = random3(param);
    vec2 corner = vec2(float(vertexID % 2u), float(vertexID / 2u));
    vec2 position = (ub.gridOffset + (ub.cellBaseVector0 * (xCell + corner.x))) + (ub.cellBaseVector1 * (yCell + corner.y));
    vec2 param_1 = cellID;
    vCornerIntensities = getCornerValues(param_1);
    vec2 param_2 = cellID;
    float param_3 = -2.0;
    vec2 param_4 = cellID;
    float param_5 = -1.0;
    vec2 param_6 = cellID;
    float param_7 = 0.0;
    vec2 param_8 = cellID;
    float param_9 = 1.0;
    vCubicCoeffs = mat4(vec4(getRowCubicCoeffs(param_2, param_3)), vec4(getRowCubicCoeffs(param_4, param_5)), vec4(getRowCubicCoeffs(param_6, param_7)), vec4(getRowCubicCoeffs(param_8, param_9)));
    vCellUV = corner;
    vColor = cellColor;
    gl_Position = ub.projection * vec4(position, 0.0, 1.0);
}

void main()
{
    calculateChunkParams();
}

