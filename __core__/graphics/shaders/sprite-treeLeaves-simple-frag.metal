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
float4 getLightColor(thread const float4& color, thread const uint& extra)
{
    float4 _26;
    if ((extra & 48u) != 0u)
    {
        _26 = float4(color.xyz, 0.0);
    }
    else
    {
        _26 = float4(0.0, 0.0, 0.0, color.w);
    }
    return _26;
}

static inline __attribute__((always_inline))
float4 getFragColor(thread const float4& color, thread const uint& extra)
{
    return select(color, float4(0.0), bool4((extra & 16u) != 0u));
}

fragment main0_out main0(main0_in in [[stage_in]], constant fsConstants& _85 [[buffer(0)]], texture2d<float> tex [[texture(0)]], texture2d<float> texDistortion [[texture(1)]], sampler texSmplr [[sampler(0)]], sampler texDistortionSmplr [[sampler(1)]])
{
    main0_out out = {};
    float2 localUV = in.vUVTexture;
    float2 distortion = float2(0.0);
    float4 offset = float4(0.0);
    if (any(in.vUVDistortion != float2(-1.0)))
    {
        offset = texDistortion.sample(texDistortionSmplr, in.vUVDistortion);
        float localTime = _85.time + (((in.vTint.x + in.vTint.y) + in.vTint.z) * 5.0);
        distortion.x = offset.x * sin((offset.y * _85.distort.x) + (localTime * _85.speed.x));
        distortion.y = offset.x * cos((offset.y * _85.distort.y) + (localTime * _85.speed.y));
        float2 localPixelXY = localUV * float2(int2(tex.get_width(), tex.get_height()));
        distortion *= (dfdx(localPixelXY.x) * _85.inverseExpectedUVDerivative);
        float2 copy = localPixelXY;
        localUV = (floor(localPixelXY) + (distortion * _85.strength)) * _85.invLeafTexSize;
        distortion = floor(localUV * float2(int2(tex.get_width(), tex.get_height()))) - floor(copy);
        if (_85.debug != 0u)
        {
            out.fragColor = float4(0.5 + (0.20000000298023223876953125 * distortion.x), 0.5 + (0.20000000298023223876953125 * distortion.y), dfdx(localPixelXY.x) * _85.inverseExpectedUVDerivative, 0.0);
        }
    }
    float4 sampledPixel = tex.sample(texSmplr, localUV);
    if (sampledPixel.w <= 0.0)
    {
        discard_fragment();
    }
    else
    {
        bool _223 = !(_85.debug != 0u);
        bool _230;
        if (!_223)
        {
            _230 = all(in.vUVDistortion == float2(-1.0));
        }
        else
        {
            _230 = _223;
        }
        if (_230)
        {
            out.fragColor = sampledPixel;
            float grayscale = ((out.fragColor.x + out.fragColor.y) + out.fragColor.z) / 4.0;
            float4 _248 = out.fragColor;
            float3 _256 = mix(float3(grayscale), _248.xyz, float3(in.vTint.w)) * in.vTint.xyz;
            out.fragColor.x = _256.x;
            out.fragColor.y = _256.y;
            out.fragColor.z = _256.z;
        }
        else
        {
            float4 _266 = out.fragColor;
            float3 _268 = _266.xyz * sampledPixel.w;
            out.fragColor.x = _268.x;
            out.fragColor.y = _268.y;
            out.fragColor.z = _268.z;
            out.fragColor.w = sampledPixel.w;
        }
    }
    float4 param = out.fragColor;
    uint param_1 = in.vExtra;
    out.lightColor = getLightColor(param, param_1);
    float4 param_2 = out.fragColor;
    uint param_3 = in.vExtra;
    out.fragColor = getFragColor(param_2, param_3);
    return out;
}

