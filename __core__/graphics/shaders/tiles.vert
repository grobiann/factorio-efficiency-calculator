#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _215;

uniform samplerBuffer maskTexCoordTable;

flat out uint vFlags;
layout(location = 3) in uint flags;
out vec4 maskUVs;
layout(location = 2) in uvec2 masks;
out vec3 vTint;
out vec2 vUV;
layout(location = 1) in vec2 uv;
layout(location = 0) in vec2 position;

vec2 getMaskUV(samplerBuffer coordTable, vec2 corner, uint maskIndex)
{
    vec4 mask = texelFetch(coordTable, int(maskIndex));
    return mask.xy + (corner * mask.zw);
}

float decodeTimeScale(uint val)
{
    float magic = uintBitsToFloat(2004877312u);
    float f = uintBitsToFloat(((val >> uint(4)) & 1023u) << uint(18));
    return f * magic;
}

float decodeDistanceFieldVariation(uint val)
{
    return 87.5 + (float(val & 15u) * 0.78125);
}

vec4 getMaskUVs(samplerBuffer coordTable, uvec2 masks_1)
{
    uint vertexID = uint(gl_VertexID) & 3u;
    uint i = vertexID / 2u;
    uint j = vertexID % 2u;
    vec2 corner = vec2(float(i), float(j));
    vec2 param = corner;
    uint param_1 = masks_1.x;
    vec2 mask1 = getMaskUV(coordTable, param, param_1);
    uint _145;
    if (masks_1.y >= 32768u)
    {
        _145 = 0u;
    }
    else
    {
        _145 = masks_1.y;
    }
    vec2 param_2 = corner;
    uint param_3 = _145;
    vec2 mask2 = getMaskUV(coordTable, param_2, param_3);
    if (masks_1.y >= 32768u)
    {
        uint param_4 = masks_1.y;
        uint param_5 = masks_1.y;
        mask2 = vec2((-2.0) - decodeTimeScale(param_4), decodeDistanceFieldVariation(param_5));
    }
    return vec4(mask1, mask2);
}

vec3 unpackRGB565(int rgb5)
{
    return vec3(ivec3(rgb5) & ivec3(63488, 2016, 31));
}

vec3 decodeRGB565(int rgb5)
{
    int param = rgb5;
    return unpackRGB565(param) * vec3(1.5751007595099508762359619140625e-05, 0.0004960317746736109256744384765625, 0.0322580635547637939453125);
}

void main()
{
    vFlags = flags;
    uvec2 param = masks;
    maskUVs = getMaskUVs(maskTexCoordTable, param);
    int param_1 = int(flags >> uint(16));
    vTint = decodeRGB565(param_1);
    vUV = uv;
    gl_Position = _215.projection * vec4(position, 0.0, 1.0);
}

