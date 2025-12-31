#version 330

struct EffectData
{
    uint flags;
    uint radius;
    vec2 shift;
};

layout(std140) uniform EffectUniforms
{
    float opacity;
    float rotation;
    float zoom;
    uint flags;
    vec2 cloudOffset;
    vec2 podOffset;
    vec2 spawnOffset;
    vec2 texSize;
    vec2 resolution;
    vec2 distanceTravelled;
    EffectData effectData[2];
} _61;

uniform sampler2D cloudLayerEffectMask;
uniform sampler2D cloudLayerTextureMask;
uniform sampler2D cloudLayerTexture;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;
in vec4 vColor;
uint maskAdvFlag;
uint quadTexFlag;
uint textureOriginType;

vec2 shiftOrigin(vec2 uv, uint originType)
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

vec2 rotate(vec2 uv)
{
    return uv * mat2(vec2(cos(_61.rotation), -sin(_61.rotation)), vec2(sin(_61.rotation), cos(_61.rotation)));
}

vec2 unpack2x16(uint value)
{
    return vec2(float(value & 65535u), float((value >> uint(16)) & 65535u)) * 0.001000000047497451305389404296875;
}

bool isStripe(uint effectFlags)
{
    return effectFlags == 5u;
}

bool isEuclidian(uint effectFlags)
{
    return (effectFlags == 1u) || (effectFlags == 3u);
}

bool isOutside(uint effectFlags)
{
    return ((effectFlags == 3u) || (effectFlags == 4u)) || (effectFlags == 5u);
}

bool isEffect(uint effectFlags)
{
    return effectFlags >= 1u;
}

bool isTexture(uint effectFlags)
{
    return (effectFlags == 6u) || (effectFlags == 7u);
}

float computeEffect(uint effectIndex, vec2 baseUV)
{
    uint effectFlags = _61.effectData[effectIndex].flags & 63u;
    uint effectOriginType = (_61.effectData[effectIndex].flags >> uint(12)) & 15u;
    uint param = _61.effectData[effectIndex].radius;
    vec2 effectRadiusUnpacked = unpack2x16(param);
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
    vec2 param_1 = baseUV;
    uint param_2 = effectOriginType;
    vec2 effectUV = shiftOrigin(param_1, param_2) + _61.effectData[effectIndex].shift;
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
        _330 = max((abs(effectUV.x) - effectRadiusMin) / (effectRadiusMax - effectRadiusMin), (abs(effectUV.y) - effectRadiusMin) / (effectRadiusMax - effectRadiusMin));
    }
    float effectDistance = _330;
    effectDistance = clamp(effectDistance, 0.0, 1.0);
    float localEffect = min(1.0, effectDistance);
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
        vec2 effectTextureUV = (effectUV / vec2(effectRadiusMax)) + vec2(0.5);
        vec4 maskTex = texture(cloudLayerEffectMask, effectTextureUV);
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

bool isAdvancedOpacityMask()
{
    return maskAdvFlag != 0u;
}

bool isQuadTex()
{
    return quadTexFlag != 0u;
}

vec2 randomQuad(vec2 uv)
{
    vec2 rand = floor(uv);
    rand = (((vec2(0.910000026226043701171875, 0.23000000417232513427734375) * log(vec2(1.0) + (rand * rand))) - (vec2(0.17000000178813934326171875, 0.3499999940395355224609375) * rand.yx)) + (vec2(0.23000000417232513427734375, 0.910000026226043701171875) * log(vec2(1.0) + (rand.yx * rand.yx)))) - (vec2(0.3499999940395355224609375, 0.17000000178813934326171875) * rand);
    rand = floor((rand - floor(rand)) * 2.0) * 0.5;
    return ((uv - floor(uv)) * 0.5) + rand;
}

void main()
{
    maskAdvFlag = (_61.flags & 128u) >> uint(7);
    quadTexFlag = (_61.flags & 64u) >> uint(6);
    textureOriginType = (_61.flags >> uint(8)) & 15u;
    vec2 samplingScale = _61.resolution / _61.texSize;
    vec2 pixelShift = vec2(0.5);
    vec2 baseUV = ((((vUV - pixelShift) * samplingScale) / vec2(32.0 * _61.zoom)) * 32.0) * 0.5;
    vec2 param = baseUV;
    uint param_1 = textureOriginType;
    vec2 param_2 = shiftOrigin(param, param_1);
    vec2 textureUV = rotate(param_2);
    textureUV -= _61.distanceTravelled;
    textureUV -= _61.cloudOffset;
    uint param_3 = 0u;
    vec2 param_4 = baseUV;
    uint param_5 = 1u;
    vec2 param_6 = baseUV;
    float localEffect = min(computeEffect(param_3, param_4), computeEffect(param_5, param_6));
    float opacityBonus = isAdvancedOpacityMask() ? localEffect : 1.0;
    float intensityMultiplier = isAdvancedOpacityMask() ? 1.0 : localEffect;
    vec2 _500;
    if (isQuadTex())
    {
        vec2 param_7 = textureUV;
        _500 = randomQuad(param_7);
    }
    else
    {
        _500 = textureUV;
    }
    vec2 texUV = _500;
    vec4 cloudMasks = texture(cloudLayerTextureMask, texUV);
    float cloudIntensity = clamp((2.0 * ((_61.opacity + opacityBonus) - 1.0)) - cloudMasks.x, 0.0, 1.0) * intensityMultiplier;
    vec4 cloudColor = texture(cloudLayerTexture, texUV);
    fragColor = cloudColor * clamp(cloudIntensity, 0.0, 1.0);
}

