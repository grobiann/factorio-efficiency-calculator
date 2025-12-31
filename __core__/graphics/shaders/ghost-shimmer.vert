#version 330

layout(std140) uniform vsConstants
{
    mat4 projection;
} _19;

layout(location = 0) in vec3 position;
out vec2 vUV;
layout(location = 1) in vec2 uv;
out vec2 vRawUV;
out vec4 vTint;
layout(location = 2) in vec4 tint;
layout(location = 3) in uint extra;
out vec4 vPos;
out vec4 vWorld;

void main()
{
    gl_Position = _19.projection * vec4(position, 1.0);
    vUV = uv;
    vRawUV = vec2(float(mod(float(gl_VertexID), 4.0) > 1.0), mod(float(gl_VertexID), 2.0));
    vTint = tint;
    uint world_x_sign = (extra >> uint(15)) & 1u;
    uint world_y_sign = (extra >> uint(31)) & 1u;
    uint world_x_num = (extra >> uint(0)) & 32767u;
    uint world_y_num = (extra >> uint(16)) & 32767u;
    float _89;
    if (world_x_sign > 0u)
    {
        _89 = -float(world_x_num ^ 32767u);
    }
    else
    {
        _89 = float(world_x_num);
    }
    float world_x = _89;
    float _103;
    if (world_y_sign > 0u)
    {
        _103 = -float(world_y_num ^ 32767u);
    }
    else
    {
        _103 = float(world_y_num);
    }
    float world_y = _103;
    vPos = vec4(position, 1.0);
    vWorld = vec4(vec2(world_x, world_y), 1.0, 1.0);
}

