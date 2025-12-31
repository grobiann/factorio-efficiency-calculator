#version 330

struct ParallaxLayerDef
{
    uint beginQuadID;
    uint endQuadID;
    vec2 seed;
    vec2 gridTopLeftCellID;
    vec2 gridOffset;
    vec2 gridSize;
    vec2 starSize;
    vec2 cellBaseVector0;
    vec2 cellBaseVector1;
};

layout(std140) uniform StarfieldConstants
{
    mat4 projection;
    vec2 resolution;
    vec2 backgroundOffset;
    float time;
    float timeRaw;
    float zoom;
    float starsPerCell;
    float starBrightness;
    float starShape;
    float starSaturation;
    int parallaxLayerCount;
    ParallaxLayerDef layers[4];
} ub;

out vec2 vUV;
flat out vec3 vColor;

vec2 random2(vec2 st)
{
    vec2 s = vec2(dot(st, vec2(12.345600128173828125, 34.141498565673828125)), dot(st, vec2(42.21540069580078125, 15.285400390625)));
    return fract(sin(s) * 45678.8984375);
}

vec3 random3(vec2 st)
{
    vec3 s = vec3(dot(st, vec2(12.345600128173828125, 34.141498565673828125)), dot(st, vec2(42.21540069580078125, 15.285400390625)), dot(st.yx, vec2(29.869800567626953125, 49.426898956298828125)));
    return fract(sin(s) * 45678.8984375);
}

bool ok_color(vec3 color)
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
    float quadID = float(uint(gl_VertexID) / 4u) - float(p.beginQuadID);
    uint vertexID = uint(gl_VertexID) % 4u;
    float cellID = floor((quadID + 0.5) / ub.starsPerCell);
    float starID = quadID - (cellID * ub.starsPerCell);
    float yCell = floor((cellID + 0.5) / p.gridSize.x);
    float xCell = cellID - (yCell * p.gridSize.x);
    vec2 cellOffset = (p.gridOffset + (p.cellBaseVector0 * xCell)) + (p.cellBaseVector1 * yCell);
    vec2 starSeed = mod(p.gridTopLeftCellID + vec2(xCell, yCell), vec2(8192.0)) + (p.seed * starID);
    vec2 param = starSeed;
    vec2 starOffset = random2(param);
    starSeed += starOffset;
    vec2 param_1 = starSeed;
    vec3 starColor = random3(param_1);
    vec2 starPos = ((p.cellBaseVector0 * starOffset.x) + (p.cellBaseVector1 * starOffset.y)) + cellOffset;
    vec2 corner = vec2(float(vertexID % 2u), float(vertexID / 2u));
    vec2 position = starPos + ((corner - vec2(0.5)) * p.starSize);
    vUV = (corner - vec2(0.5)) * 2.0;
    vColor = starColor;
    gl_Position = ub.projection * vec4(position, 0.0, 1.0);
    vec3 param_2 = starColor;
    if (!ok_color(param_2))
    {
        gl_Position = vec4(-777.0, -777.0, 0.0, 1.0);
    }
}

void main()
{
    uint quadID = uint(gl_VertexID) / 4u;
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
    calculateStarParams(param);
}

