#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
    float vOpacity [[user(locn1)]];
    uint vExtra [[user(locn2)]];
    float vFalloff [[user(locn3), flat]];
    float2 vRelativePosition [[user(locn4)]];
    float2 vRectSize [[user(locn5), flat]];
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

static inline __attribute__((always_inline))
float getDist(thread float2& vRelativePosition, thread float2& vRectSize)
{
    float2 d = abs(vRelativePosition) - vRectSize;
    return length(fast::max(d, float2(0.0)));
}

fragment main0_out main0(main0_in in [[stage_in]], texture2d<float> tex1 [[texture(0)]], texture2d<float> tex2 [[texture(1)]], sampler tex1Smplr [[sampler(0)]], sampler tex2Smplr [[sampler(1)]])
{
    main0_out out = {};
    float4 color = tex1.sample(tex1Smplr, in.vUV);
    bool debug = (in.vExtra & 512u) != 0u;
    bool yCoCg = (in.vExtra & 256u) != 0u;
    if (yCoCg)
    {
        float4 param = color;
        float param_1 = tex2.sample(tex2Smplr, in.vUV).x;
        color = YCoCgToRGB(param, param_1);
    }
    float d = getDist(in.vRelativePosition, in.vRectSize) / in.vFalloff;
    float a = 1.0 - fast::min(1.0, d);
    color *= (in.vOpacity * a);
    out.fragColor = color;
    return out;
}

