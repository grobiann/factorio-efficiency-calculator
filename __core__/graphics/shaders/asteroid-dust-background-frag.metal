#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct CellUVs
{
    float2 uvs;
    float2 randomValue;
    float rotationAngle;
    short clamped;
};

struct SpaceDustConstants
{
    float2 letfTopMapPosition;
    float2 pixelShift;
    float2 backgroundCenter;
    float2 platformOffset;
    float2 resolution;
    float zoom;
    float daytimeAlpha;
    float time;
    float animationSpeed;
    float platformSpeed;
    float maxPlatformSpeedEstimate;
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
float4 createSamplingUvs(thread const float2& uv)
{
    float2 integerUvs = floor(uv);
    float2 repeatingUvs = uv - integerUvs;
    return float4(repeatingUvs, integerUvs);
}

static inline __attribute__((always_inline))
float2 random2(thread const float2& st)
{
    float2 s = float2(dot(st, float2(12.345600128173828125, 34.141498565673828125)), dot(st, float2(42.21540069580078125, 15.285400390625)));
    return fract(sin(s) * 45678.8984375);
}

static inline __attribute__((always_inline))
float2 rotateUV(thread const float2& uv, thread const float& angle, thread const float2& pivot)
{
    float2 offsetUv = uv - pivot;
    float angleCos = cos(angle);
    float angleSin = sin(angle);
    return float2((offsetUv.x * angleCos) - (offsetUv.y * angleSin), (offsetUv.x * angleSin) + (offsetUv.y * angleCos)) + pivot;
}

static inline __attribute__((always_inline))
float cheapContrast(thread const float& value, thread const float& threshold)
{
    return fast::clamp((value - threshold) * (1.0 / threshold), 0.0, 1.0);
}

static inline __attribute__((always_inline))
float2 scaleUvWithOffset(thread const float2& uv, thread const float& scale, thread const float2& offset)
{
    return ((uv - offset) * scale) + offset;
}

static inline __attribute__((always_inline))
CellUVs offsetRandomUvs(thread const float2& inputUv, thread const float2& integerUv, thread const float2& offset, thread const float& subUv, thread const float& scale, thread const float& rotSpeed, constant SpaceDustConstants& _185)
{
    float2 modUv = integerUv + offset;
    float2 param = modUv;
    CellUVs result;
    result.randomValue = random2(param);
    float2 randomUvIndex = floor(result.randomValue * subUv);
    float2 offsetUvs = (inputUv - offset) - result.randomValue;
    float2 randomOffsetUvs = offsetUvs + randomUvIndex;
    result.rotationAngle = (((_185.time / rotSpeed) * (result.randomValue.x - 0.25)) * 2.0) + result.randomValue.y;
    float2 param_1 = randomOffsetUvs;
    float param_2 = result.rotationAngle;
    float2 param_3 = randomUvIndex + float2(0.5);
    float2 rotatedUvs = rotateUV(param_1, param_2, param_3);
    float param_4 = result.randomValue.y;
    float param_5 = 0.699999988079071044921875;
    float scaleValue = (scale * 1.0) / fast::clamp(cheapContrast(param_4, param_5) * 4.0, 9.9999997473787516355514526367188e-05, 1.0);
    float2 param_6 = rotatedUvs;
    float param_7 = scaleValue;
    float2 param_8 = randomUvIndex + float2(0.5);
    float2 scaleUvs = scaleUvWithOffset(param_6, param_7, param_8);
    float2 clampWrappingUvs = fast::clamp(scaleUvs, randomUvIndex, randomUvIndex + float2(1.0));
    result.clamped = short(any(clampWrappingUvs != scaleUvs));
    result.uvs = clampWrappingUvs * (1.0 / subUv);
    return result;
}

static inline __attribute__((always_inline))
void sampleRandomCell(thread const float2& inputUv, thread const float2& integerUv, texture2d<float> image, sampler imageSmplr, thread const float& subUv, thread const float& scale, thread const float& rotSpeed, thread float4& sampledTexture, thread float& rotationAngle, thread float2& randomValue, constant SpaceDustConstants& _185)
{
    float2 param = inputUv;
    float2 param_1 = integerUv;
    float2 param_2 = float2(0.0);
    float param_3 = subUv;
    float param_4 = scale;
    float param_5 = rotSpeed;
    CellUVs centerParams = offsetRandomUvs(param, param_1, param_2, param_3, param_4, param_5, _185);
    float2 param_6 = inputUv;
    float2 param_7 = integerUv;
    float2 param_8 = float2(0.0, -1.0);
    float param_9 = subUv;
    float param_10 = scale;
    float param_11 = rotSpeed;
    CellUVs aboveParams = offsetRandomUvs(param_6, param_7, param_8, param_9, param_10, param_11, _185);
    float2 param_12 = inputUv;
    float2 param_13 = integerUv;
    float2 param_14 = float2(-1.0, 0.0);
    float param_15 = subUv;
    float param_16 = scale;
    float param_17 = rotSpeed;
    CellUVs leftParams = offsetRandomUvs(param_12, param_13, param_14, param_15, param_16, param_17, _185);
    float2 param_18 = inputUv;
    float2 param_19 = integerUv;
    float2 param_20 = float2(-1.0);
    float param_21 = subUv;
    float param_22 = scale;
    float param_23 = rotSpeed;
    CellUVs aboveLeftParams = offsetRandomUvs(param_18, param_19, param_20, param_21, param_22, param_23, _185);
    float4 _322;
    if (bool(centerParams.clamped))
    {
        _322 = float4(0.0);
    }
    else
    {
        _322 = image.sample(imageSmplr, centerParams.uvs);
    }
    float4 center = _322;
    float4 _335;
    if (bool(aboveParams.clamped))
    {
        _335 = float4(0.0);
    }
    else
    {
        _335 = image.sample(imageSmplr, aboveParams.uvs);
    }
    float4 above = _335;
    float4 _347;
    if (bool(leftParams.clamped))
    {
        _347 = float4(0.0);
    }
    else
    {
        _347 = image.sample(imageSmplr, leftParams.uvs);
    }
    float4 left = _347;
    float4 _359;
    if (bool(aboveLeftParams.clamped))
    {
        _359 = float4(0.0);
    }
    else
    {
        _359 = image.sample(imageSmplr, aboveLeftParams.uvs);
    }
    float4 aboveLeft = _359;
    randomValue = mix(mix(mix(centerParams.randomValue, aboveParams.randomValue, float2(above.w)), leftParams.randomValue, float2(left.w)), aboveLeftParams.randomValue, float2(aboveLeft.w));
    rotationAngle = mix(mix(mix(mix(0.0, centerParams.rotationAngle, center.w), aboveParams.rotationAngle, above.w), leftParams.rotationAngle, left.w), aboveLeftParams.rotationAngle, aboveLeft.w);
    sampledTexture = float4(mix(mix(mix(center.xyz, above.xyz, float3(above.w)), left.xyz, float3(left.w)), aboveLeft.xyz, float3(aboveLeft.w)), fast::clamp(((center.w + left.w) + above.w) + aboveLeft.w, 0.0, 1.0));
}

fragment main0_out main0(main0_in in [[stage_in]], constant SpaceDustConstants& _185 [[buffer(0)]], texture2d<float> asteroidTexture [[texture(1)]], texture2d<float> asteroidNormalTexture [[texture(2)]], sampler asteroidTextureSmplr [[sampler(1)]], sampler asteroidNormalTextureSmplr [[sampler(2)]])
{
    main0_out out = {};
    float2 mapPosition = (_185.letfTopMapPosition + ((in.vUV * _185.resolution) / float2(32.0 * _185.zoom))) * 32.0;
    mapPosition += _185.platformOffset;
    float2 uv = mapPosition / float2(1536.0);
    float2 vUV2 = in.vUV;
    float2 vUV = uv;
    uv /= float2(2.0);
    float subTileCount = 4.0;
    float asteroidScale = 4.400000095367431640625;
    float globalTiling = 2.0;
    float asteroidSpeed = 2.2999999523162841796875;
    float2 tileUvs = (vUV * globalTiling) + fast::min(float2(0.0, (_185.platformOffset.y / ((subTileCount * asteroidSpeed) * asteroidScale)) - ((_185.time / asteroidSpeed) / 1000.0)), float2(-0.00999999977648258209228515625));
    tileUvs *= subTileCount;
    float2 integerUvs = floor(tileUvs);
    float2 repeatingUvs = tileUvs - integerUvs;
    float rotation_speed = 250.0;
    float2 param = tileUvs + float2(0.0, _185.time / 500.0);
    float4 bottomLayerUvs = createSamplingUvs(param);
    float2 param_1 = repeatingUvs;
    float2 param_2 = integerUvs;
    float param_3 = subTileCount;
    float param_4 = asteroidScale / globalTiling;
    float param_5 = rotation_speed * 0.75;
    float4 param_6;
    float param_7;
    float2 param_8;
    sampleRandomCell(param_1, param_2, asteroidTexture, asteroidTextureSmplr, param_3, param_4, param_5, param_6, param_7, param_8, _185);
    float4 asteroidTopLayer = param_6;
    float asteroidTopLayerRotation = param_7;
    float2 asteroidTopLayerRandom = param_8;
    float2 param_9 = bottomLayerUvs.xy;
    float2 param_10 = bottomLayerUvs.zw;
    float param_11 = subTileCount;
    float param_12 = ((asteroidScale / 1.25) * 2.0) / globalTiling;
    float param_13 = rotation_speed;
    float4 param_14;
    float param_15;
    float2 param_16;
    sampleRandomCell(param_9, param_10, asteroidTexture, asteroidTextureSmplr, param_11, param_12, param_13, param_14, param_15, param_16, _185);
    float4 asteroidMidLayer = param_14;
    float asteroidMidLayerRotation = param_15;
    float2 asteroidMidLayerRandom = param_16;
    float randomBrightness = fast::max(0.4000000059604644775390625, 0.5 + mix(asteroidMidLayerRandom, asteroidTopLayerRandom, float2(asteroidTopLayer.w)).x);
    float2 param_17 = repeatingUvs;
    float2 param_18 = integerUvs;
    float param_19 = subTileCount;
    float param_20 = asteroidScale / globalTiling;
    float param_21 = rotation_speed * 0.75;
    float4 param_22;
    float param_23;
    float2 param_24;
    sampleRandomCell(param_17, param_18, asteroidNormalTexture, asteroidNormalTextureSmplr, param_19, param_20, param_21, param_22, param_23, param_24, _185);
    float4 asteroidTopLayerNormal = param_22;
    float asteroidTopLayerNormalRotation = param_23;
    float2 normalRandom_throwaway = param_24;
    float2 param_25 = bottomLayerUvs.xy;
    float2 param_26 = bottomLayerUvs.zw;
    float param_27 = subTileCount;
    float param_28 = ((asteroidScale / 1.25) * 2.0) / globalTiling;
    float param_29 = rotation_speed;
    float4 param_30;
    float param_31;
    float2 param_32;
    sampleRandomCell(param_25, param_26, asteroidNormalTexture, asteroidNormalTextureSmplr, param_27, param_28, param_29, param_30, param_31, param_32, _185);
    float4 asteroidMidLayerNormal = param_30;
    float asteroidMidLayerNormalRotation = param_31;
    normalRandom_throwaway = param_32;
    float asteroidAlpha = fast::clamp(asteroidMidLayer.w + (asteroidTopLayer.w * 10.0), 0.0, 1.0);
    float4 ambientLight = float4(mix(asteroidMidLayer.xyz * 0.12999999523162841796875, asteroidTopLayer.xyz * 0.23000000417232513427734375, float3(asteroidTopLayer.w)) * randomBrightness, asteroidAlpha);
    float4 litColour = float4(mix(asteroidMidLayer.xyz * 0.17000000178813934326171875, asteroidTopLayer.xyz * 0.2700000107288360595703125, float3(asteroidTopLayer.w)) * randomBrightness, asteroidAlpha);
    float4 normal_img = mix(asteroidMidLayerNormal, asteroidTopLayerNormal, float4(asteroidTopLayer.w));
    float normalRotation = mix(asteroidMidLayerNormalRotation, asteroidTopLayerNormalRotation, asteroidTopLayer.w);
    float normalStrength = 2.0;
    float lightWidth = 0.0;
    float3 normal = fast::normalize((normal_img.xyz * float3(1.0, 1.0, 0.5)) - float3(0.5, 0.5, 0.0));
    normal = fast::normalize(float3(0.0, 0.0, 1.0) + ((normal - float3(0.0, 0.0, 1.0)) * normalStrength));
    float3 rotated_normal = float3((normal.x * cos(normalRotation)) + (normal.y * sin(normalRotation)), ((-normal.x) * sin(normalRotation)) + (normal.y * cos(normalRotation)), normal.z);
    float3 illumination = float3(0.0);
    float3 lights_diffuse = float3(0.0);
    float3 light_color = float3(1.0);
    float3 light_direction = float3(0.66564023494720458984375, 0.4992301762104034423828125, -0.554700195789337158203125);
    float lighting = fast::max(0.0, dot(rotated_normal, -light_direction) + lightWidth);
    float3 light_diffuse = (light_color * lighting) * 1.0;
    illumination += (light_color * fast::max(-1.0, lighting));
    lights_diffuse += light_diffuse;
    lights_diffuse *= asteroidAlpha;
    float4 finalColor = float4((lights_diffuse + ambientLight.xyz) * litColour.xyz, litColour.w) * 1.0;
    out.fragColor = finalColor;
    return out;
}

