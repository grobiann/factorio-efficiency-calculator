#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct mipMapGenParams
{
    int2 offset;
    int unusedLevel;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

fragment main0_out main0(constant mipMapGenParams& _27 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float4 color = float4(0.0);
    int2 coord = (int2(2) * int2(gl_FragCoord.xy)) + _27.offset;
    for (int y = 0; y < 2; y++)
    {
        for (int x = 0; x < 2; x++)
        {
            float4 t1 = tex.read(uint2((coord + int2(x, y))), 0);
            color += t1;
        }
    }
    out.fragColor = color * 0.25;
    return out;
}

