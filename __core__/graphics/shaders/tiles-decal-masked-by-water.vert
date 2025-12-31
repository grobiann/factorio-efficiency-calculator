#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _68;

flat out uint vFlags;
layout(location = 3) in uint flags;
out vec3 vTint;
out vec2 vUV;
layout(location = 1) in vec2 uv;
layout(location = 0) in vec2 position;
layout(location = 2) in uvec2 masks;

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
    int param = int(flags >> uint(16));
    vTint = decodeRGB565(param);
    vUV = uv;
    gl_Position = _68.projection * vec4(position, 0.0, 1.0);
}

