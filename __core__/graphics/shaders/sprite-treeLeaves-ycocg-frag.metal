#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct fsConstants
{
    float2 invLeafTexSize;
    float2 strength;
    float2 distort;
    float2 speed;
    float time;
    float inverseExpectedUVDerivative;
    uint debug;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
    float4 lightColor [[color(1)]];
};

struct main0_in
{
    float4 vTint [[user(locn0)]];
    float2 vUVTexture [[user(locn1)]];
    float2 vUVDistortion [[user(locn2)]];
    uint vExtra [[user(locn3)]];
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
float4 getLightColor(thread const float4& color, thread const uint& extra)
{
    float4 _82;
    if ((extra & 48u) != 0u)
    {
        _82 = float4(color.xyz, 0.0);
    }
    else
    {
        _82 = float4(0.0, 0.0, 0.0, color.w);
    }
    return _82;
}

static inline __attribute__((always_inline))
float4 getFragColor(thread const float4& color, thread const uint& extra)
{
    return select(color, float4(0.0), bool4((extra & 16u) != 0u));
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _139 [[buffer(0)]], texture2d<float> texYCoCg [[texture(0)]], texture2d<float> texAlpha [[texture(1)]], texture2d<float> texDistortion [[texture(2)]], sampler texYCoCgSmplr [[sampler(0)]], sampler texAlphaSmplr [[sampler(1)]], sampler texDistortionSmplr [[sampler(2)]])
{
    main0_out out = {};
    float2 localUV = in.vUVTexture;
    float2 distortion = float2(0.0);
    float4 offset = float4(0.0);
    if (any(in.vUVDistortion != float2(-1.0)))
    {
        offset = texDistortion.sample(texDistortionSmplr, in.vUVDistortion);
        float localTime = _139.time + (((in.vTint.x + in.vTint.y) + in.vTint.z) * 5.0);
        distortion.x = offset.x * sin((offset.y * _139.distort.x) + (localTime * _139.speed.x));
        distortion.y = offset.x * cos((offset.y * _139.distort.y) + (localTime * _139.speed.y));
        float2 localPixelXY = localUV * float2(int2(texYCoCg.get_width(), texYCoCg.get_height()));
        distortion *= (dfdx(localPixelXY.x) * _139.inverseExpectedUVDerivative);
        float2 copy = localPixelXY;
        localUV = (floor(localPixelXY) + (distortion * _139.strength)) * _139.invLeafTexSize;
        distortion = floor(localUV * float2(int2(texYCoCg.get_width(), texYCoCg.get_height()))) - floor(copy);
        if (_139.debug != 0u)
        {
            out.fragColor = float4(0.5 + (0.20000000298023223876953125 * distortion.x), 0.5 + (0.20000000298023223876953125 * distortion.y), dfdx(localPixelXY.x) * _139.inverseExpectedUVDerivative, 0.0);
        }
    }
    float2 dUVdx = dfdx(localUV);
    float2 dUVdy = dfdy(localUV);
    float alpha = texAlpha.sample(texAlphaSmplr, localUV, gradient2d(dUVdx, dUVdy)).x;
    if (alpha <= 0.0)
    {
        discard_fragment();
    }
    else
    {
        bool _284 = !(_139.debug != 0u);
        bool _291;
        if (!_284)
        {
            _291 = all(in.vUVDistortion == float2(-1.0));
        }
        else
        {
            _291 = _284;
        }
        if (_291)
        {
            float4 yCoCg = texYCoCg.sample(texYCoCgSmplr, localUV, gradient2d(dUVdx, dUVdy));
            float4 param = yCoCg;
            float param_1 = alpha;
            out.fragColor = YCoCgToRGB(param, param_1);
            float3 grayscale = ((out.fragColor.xxx + out.fragColor.yyy) + out.fragColor.zzz) / float3(4.0);
            float4 _319 = out.fragColor;
            float3 _327 = mix(grayscale, _319.xyz, float3(in.vTint.w)) * in.vTint.xyz;
            out.fragColor.x = _327.x;
            out.fragColor.y = _327.y;
            out.fragColor.z = _327.z;
        }
        else
        {
            float4 _337 = out.fragColor;
            float3 _339 = _337.xyz * alpha;
            out.fragColor.x = _339.x;
            out.fragColor.y = _339.y;
            out.fragColor.z = _339.z;
            out.fragColor.w = alpha;
        }
    }
    float4 param_2 = out.fragColor;
    uint param_3 = in.vExtra;
    out.lightColor = getLightColor(param_2, param_3);
    float4 param_4 = out.fragColor;
    uint param_5 = in.vExtra;
    out.fragColor = getFragColor(param_4, param_5);
    return out;
}

