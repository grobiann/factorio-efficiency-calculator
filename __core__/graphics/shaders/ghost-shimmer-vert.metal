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

struct vsConstants
{
    float4x4 projection;
};

struct main0_out
{
    float2 vUV [[user(locn0)]];
    float2 vRawUV [[user(locn1)]];
    float4 vTint [[user(locn2)]];
    float4 vPos [[user(locn3)]];
    float4 vWorld [[user(locn4)]];
    float4 gl_Position [[position]];
};

struct main0_in
{
    float3 position [[attribute(0)]];
    float2 uv [[attribute(1)]];
    float4 tint [[attribute(2)]];
    uint extra [[attribute(3)]];
};

vertex main0_out main0(main0_in in [[stage_in]], constant vsConstants& _19 [[buffer(0)]], uint gl_VertexIndex [[vertex_id]])
{
    main0_out out = {};
    out.gl_Position = _19.projection * float4(in.position, 1.0);
    out.vUV = in.uv;
    out.vRawUV = float2(float(mod(float(int(gl_VertexIndex)), 4.0) > 1.0), mod(float(int(gl_VertexIndex)), 2.0));
    out.vTint = in.tint;
    uint world_x_sign = (in.extra >> uint(15)) & 1u;
    uint world_y_sign = (in.extra >> uint(31)) & 1u;
    uint world_x_num = (in.extra >> uint(0)) & 32767u;
    uint world_y_num = (in.extra >> uint(16)) & 32767u;
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
    out.vPos = float4(in.position, 1.0);
    out.vWorld = float4(float2(world_x, world_y), 1.0, 1.0);
    return out;
}

