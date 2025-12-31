#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

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

static inline __attribute__((always_inline))
float4 YCoCgToRGB(thread const float4& ycocg, thread const float& alpha)
{
    float Y = ycocg.w;
    float scale = 1.0 / ((31.875 * ycocg.z) + 1.0);
    float Co = (ycocg.x - 0.501960813999176025390625) * scale;
    float Cg = (ycocg.y - 0.501960813999176025390625) * scale;
    float R = (Y + Co) - Cg;
    float G = Y + Cg;
    float B = (Y - Co) - Cg;
    return float4(R, G, B, alpha);
}

fragment main0_out main0(constant mipMapGenParams& _85 [[buffer(0)]], texture2d<float> tex [[texture(0)]], texture2d<float> tex2 [[texture(1)]], sampler texSmplr [[sampler(0)]], sampler tex2Smplr [[sampler(1)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    float4 color = float4(0.0);
    int2 coord = (int2(2) * int2(gl_FragCoord.xy)) + _85.offset;
    for (int y = 0; y < 2; y++)
    {
        for (int x = 0; x < 2; x++)
        {
            float4 t1 = tex.read(uint2((coord + int2(x, y))), 0);
            float a1 = tex2.read(uint2((coord + int2(x, y))), 0).x;
            float4 param = t1;
            float param_1 = a1;
            t1 = YCoCgToRGB(param, param_1);
            color += t1;
        }
    }
    out.fragColor = color * 0.25;
    return out;
}

