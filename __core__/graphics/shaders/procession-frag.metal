#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectData
{
    uint flags;
    uint radius;
    float2 shift;
};

struct EffectUniforms
{
    float opacity;
    float rotation;
    float zoom;
    uint flags;
    float2 cloudOffset;
    float2 podOffset;
    float2 spawnOffset;
    float2 texSize;
    float2 resolution;
    float2 distanceTravelled;
    EffectData effectData[2];
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

static inline __attribute__((always_inline))
float2 shiftOrigin(thread const float2& uv, thread const uint& originType, constant EffectUniforms& _61)
{
    if (originType == 0u)
    {
        return uv + _61.podOffset;
    }
    if (originType == 2u)
    {
        return (uv + _61.podOffset) - _61.spawnOffset;
    }
    return uv;
}

static inline __attribute__((always_inline))
float2 rotate(thread const float2& uv, constant EffectUniforms& _61)
{
    return uv * float2x2(float2(cos(_61.rotation), -sin(_61.rotation)), float2(sin(_61.rotation), cos(_61.rotation)));
}

static inline __attribute__((always_inline))
float2 unpack2x16(thread const uint& value)
{
    return float2(float(value & 65535u), float((value >> uint(16)) & 65535u)) * 0.001000000047497451305389404296875;
}

static inline __attribute__((always_inline))
bool isStripe(thread const uint& effectFlags)
{
    return effectFlags == 5u;
}

static inline __attribute__((always_inline))
bool isEuclidian(thread const uint& effectFlags)
{
    return (effectFlags == 1u) || (effectFlags == 3u);
}

static inline __attribute__((always_inline))
bool isOutside(thread const uint& effectFlags)
{
    return ((effectFlags == 3u) || (effectFlags == 4u)) || (effectFlags == 5u);
}

static inline __attribute__((always_inline))
bool isEffect(thread const uint& effectFlags)
{
    return effectFlags >= 1u;
}

static inline __attribute__((always_inline))
bool isTexture(thread const uint& effectFlags)
{
    return (effectFlags == 6u) || (effectFlags == 7u);
}

static inline __attribute__((always_inline))
float computeEffect(thread const uint& effectIndex, thread const float2& baseUV, constant EffectUniforms& _61, texture2d<float> cloudLayerEffectMask, sampler cloudLayerEffectMaskSmplr)
{
    uint effectFlags = _61.effectData[effectIndex].flags & 63u;
    uint effectOriginType = (_61.effectData[effectIndex].flags >> uint(12)) & 15u;
    uint param = _61.effectData[effectIndex].radius;
    float2 effectRadiusUnpacked = unpack2x16(param);
    float _278;
    if (effectRadiusUnpacked.x < effectRadiusUnpacked.y)
    {
        _278 = effectRadiusUnpacked.x;
    }
    else
    {
        _278 = effectRadiusUnpacked.y;
    }
    float effectRadiusMin = _278;
    float _293;
    if (effectRadiusUnpacked.x < effectRadiusUnpacked.y)
    {
        _293 = effectRadiusUnpacked.y;
    }
    else
    {
        _293 = effectRadiusUnpacked.x;
    }
    float effectRadiusMax = _293;
    float2 param_1 = baseUV;
    uint param_2 = effectOriginType;
    float2 effectUV = shiftOrigin(param_1, param_2, _61) + _61.effectData[effectIndex].shift;
    uint param_3 = effectFlags;
    float _316;
    if (isStripe(param_3))
    {
        _316 = effectUV.y;
    }
    else
    {
        _316 = effectUV.x;
    }
    effectUV.x = _316;
    uint param_4 = effectFlags;
    float _330;
    if (isEuclidian(param_4))
    {
        _330 = (length(effectUV) - effectRadiusMin) / (effectRadiusMax - effectRadiusMin);
    }
    else
    {
        _330 = fast::max((abs(effectUV.x) - effectRadiusMin) / (effectRadiusMax - effectRadiusMin), (abs(effectUV.y) - effectRadiusMin) / (effectRadiusMax - effectRadiusMin));
    }
    float effectDistance = _330;
    effectDistance = fast::clamp(effectDistance, 0.0, 1.0);
    float localEffect = fast::min(1.0, effectDistance);
    uint param_5 = effectFlags;
    if (isOutside(param_5))
    {
        localEffect = 1.0 - localEffect;
    }
    uint param_6 = effectFlags;
    if (!isEffect(param_6))
    {
        localEffect = 1.0;
    }
    uint param_7 = effectFlags;
    if (isTexture(param_7))
    {
        float2 effectTextureUV = (effectUV / float2(effectRadiusMax)) + float2(0.5);
        float4 maskTex = cloudLayerEffectMask.sample(cloudLayerEffectMaskSmplr, effectTextureUV);
        bool _406 = effectTextureUV.x >= 0.0;
        bool _412;
        if (_406)
        {
            _412 = effectTextureUV.y >= 0.0;
        }
        else
        {
            _412 = _406;
        }
        bool _418;
        if (_412)
        {
            _418 = effectTextureUV.x <= 1.0;
        }
        else
        {
            _418 = _412;
        }
        bool _424;
        if (_418)
        {
            _424 = effectTextureUV.y <= 1.0;
        }
        else
        {
            _424 = _418;
        }
        bool showTexture = _424;
        float _426;
        if (showTexture)
        {
            _426 = maskTex.x;
        }
        else
        {
            _426 = float(effectFlags == 7u);
        }
        localEffect = _426;
    }
    return localEffect;
}

static inline __attribute__((always_inline))
bool isAdvancedOpacityMask(thread uint& maskAdvFlag)
{
    return maskAdvFlag != 0u;
}

static inline __attribute__((always_inline))
bool isQuadTex(thread uint& quadTexFlag)
{
    return quadTexFlag != 0u;
}

static inline __attribute__((always_inline))
float2 randomQuad(thread const float2& uv)
{
    float2 rand = floor(uv);
    rand = (((float2(0.910000026226043701171875, 0.23000000417232513427734375) * log(float2(1.0) + (rand * rand))) - (float2(0.17000000178813934326171875, 0.3499999940395355224609375) * rand.yx)) + (float2(0.23000000417232513427734375, 0.910000026226043701171875) * log(float2(1.0) + (rand.yx * rand.yx)))) - (float2(0.3499999940395355224609375, 0.17000000178813934326171875) * rand);
    rand = floor((rand - floor(rand)) * 2.0) * 0.5;
    return ((uv - floor(uv)) * 0.5) + rand;
}

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _61 [[buffer(0)]], texture2d<float> cloudLayerTexture [[texture(0)]], texture2d<float> cloudLayerTextureMask [[texture(1)]], texture2d<float> cloudLayerEffectMask [[texture(2)]], sampler cloudLayerTextureSmplr [[sampler(0)]], sampler cloudLayerTextureMaskSmplr [[sampler(1)]], sampler cloudLayerEffectMaskSmplr [[sampler(2)]])
{
    main0_out out = {};
    uint maskAdvFlag = (_61.flags & 128u) >> uint(7);
    uint quadTexFlag = (_61.flags & 64u) >> uint(6);
    uint textureOriginType = (_61.flags >> uint(8)) & 15u;
    float2 samplingScale = _61.resolution / _61.texSize;
    float2 pixelShift = float2(0.5);
    float2 baseUV = ((((in.vUV - pixelShift) * samplingScale) / float2(32.0 * _61.zoom)) * 32.0) * 0.5;
    float2 param = baseUV;
    uint param_1 = textureOriginType;
    float2 param_2 = shiftOrigin(param, param_1, _61);
    float2 textureUV = rotate(param_2, _61);
    textureUV -= _61.distanceTravelled;
    textureUV -= _61.cloudOffset;
    uint param_3 = 0u;
    float2 param_4 = baseUV;
    uint param_5 = 1u;
    float2 param_6 = baseUV;
    float localEffect = fast::min(computeEffect(param_3, param_4, _61, cloudLayerEffectMask, cloudLayerEffectMaskSmplr), computeEffect(param_5, param_6, _61, cloudLayerEffectMask, cloudLayerEffectMaskSmplr));
    float opacityBonus = isAdvancedOpacityMask(maskAdvFlag) ? localEffect : 1.0;
    float intensityMultiplier = isAdvancedOpacityMask(maskAdvFlag) ? 1.0 : localEffect;
    float2 _500;
    if (isQuadTex(quadTexFlag))
    {
        float2 param_7 = textureUV;
        _500 = randomQuad(param_7);
    }
    else
    {
        _500 = textureUV;
    }
    float2 texUV = _500;
    float4 cloudMasks = cloudLayerTextureMask.sample(cloudLayerTextureMaskSmplr, texUV);
    float cloudIntensity = fast::clamp((2.0 * ((_61.opacity + opacityBonus) - 1.0)) - cloudMasks.x, 0.0, 1.0) * intensityMultiplier;
    float4 cloudColor = cloudLayerTexture.sample(cloudLayerTextureSmplr, texUV);
    out.fragColor = cloudColor * fast::clamp(cloudIntensity, 0.0, 1.0);
    return out;
}

