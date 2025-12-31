#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

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
float2 PanningUV2(thread const float2& uv, thread const float& speedX, thread const float& speedY, thread const float& time1, constant SpaceDustConstants& _66)
{
    float2 uvDist = uv;
    uvDist.x -= ((_66.time / 1000.0) * speedX);
    uvDist.y -= (time1 / 10.0);
    return fract(uvDist);
}

static inline __attribute__((always_inline))
float2 PanningUV(thread const float2& uv, thread const float& speedX, thread const float& speedY, thread const float& time1)
{
    float2 uvDist = uv;
    uvDist.x -= fract((time1 / 1000.0) * speedX);
    uvDist.y -= fract((time1 / 1000.0) * speedY);
    return fract(uvDist);
}

static inline __attribute__((always_inline))
float histogramSelect(thread const float& image, thread const float& position, thread const float& range)
{
    return 1.0 + (fast::min(image - position, position - image) / range);
}

static inline __attribute__((always_inline))
float histogramScan(thread const float& image, thread const float& position)
{
    return fast::clamp(image - (1.0 - position), 0.0, 1.0);
}

fragment main0_out main0(main0_in in [[stage_in]], constant SpaceDustConstants& _66 [[buffer(0)]], texture2d<float> noiseTexture [[texture(0)]], sampler noiseTextureSmplr [[sampler(0)]])
{
    main0_out out = {};
    float2 mapPosition = (_66.letfTopMapPosition + ((in.vUV * _66.resolution) / float2(32.0 * _66.zoom))) * 32.0;
    mapPosition += _66.platformOffset;
    float2 uv = mapPosition / float2(1536.0);
    uv /= float2(5.0);
    float maxSpeed = _66.maxPlatformSpeedEstimate;
    float parralaxScale = 0.5;
    float2 platformOffset1 = _66.platformOffset / float2(3.0);
    float normalizedSpeed = _66.platformSpeed;
    float trueTime = 1.0 / (normalizedSpeed / (1.0 - _66.platformOffset.y));
    platformOffset1 = float2(platformOffset1.x, platformOffset1.y - (_66.time / 1000.0));
    float speckSpeed = _66.platformOffset.y / parralaxScale;
    float speedAsPercent = fast::clamp(normalizedSpeed / maxSpeed, 0.0, 1.0);
    float fadePeriod = 2.0;
    float2 closeUV = uv * 4.0;
    float2 midUV = (uv * 4.0) / float2(parralaxScale);
    float2 closeUVDust = uv;
    float2 midUVDust = uv / float2(parralaxScale);
    float2 param = midUV;
    float param_1 = 0.0;
    float param_2 = speckSpeed * parralaxScale;
    float param_3 = (-platformOffset1.y) * 4.0;
    midUV = PanningUV2(param, param_1, param_2, param_3, _66);
    float2 param_4 = closeUV;
    float param_5 = 0.0;
    float param_6 = speckSpeed;
    float param_7 = (-platformOffset1.y) * 4.0;
    float2 panningCloseUV = PanningUV2(param_4, param_5, param_6, param_7, _66);
    closeUV = panningCloseUV;
    float2 param_8 = uv / float2(2.0);
    float param_9 = 0.5;
    float param_10 = 5.0;
    float param_11 = _66.time - platformOffset1.y;
    float2 highSpeedSpeckUV = PanningUV(param_8, param_9, param_10, param_11);
    float3 highSpeedSpeck = float3(noiseTexture.sample(noiseTextureSmplr, highSpeedSpeckUV).y) * 0.0;
    float2 param_12 = midUVDust;
    float param_13 = 0.0;
    float param_14 = normalizedSpeed * parralaxScale;
    float param_15 = -platformOffset1.y;
    midUVDust = PanningUV2(param_12, param_13, param_14, param_15, _66);
    float2 param_16 = closeUVDust;
    float param_17 = 0.0;
    float param_18 = normalizedSpeed;
    float param_19 = -platformOffset1.y;
    closeUVDust = PanningUV2(param_16, param_17, param_18, param_19, _66);
    float speckMask = noiseTexture.sample(noiseTextureSmplr, closeUV).w;
    float fadeMask = sin(platformOffset1.y / 2.0);
    float fadeTime = (fadeMask + 4.0) / 8.0;
    float param_20 = speckMask;
    float param_21 = fadeTime;
    float param_22 = 0.0500000007450580596923828125;
    float randomSpeckMask = fast::clamp(histogramSelect(param_20, param_21, param_22), 0.0, 1.0);
    float param_23 = speckMask;
    float param_24 = fadeTime;
    float param_25 = 0.0500000007450580596923828125;
    float randomSpeckMask3 = fast::clamp(histogramSelect(param_23, param_24, param_25), 0.0, 1.0);
    float param_26 = speckMask;
    float param_27 = fadeTime;
    float param_28 = 0.004999999888241291046142578125;
    float randomSpeckMask2 = fast::clamp(histogramSelect(param_26, param_27, param_28), 0.0, 1.0);
    highSpeedSpeck = fast::clamp(highSpeedSpeck * randomSpeckMask2, float3(0.0), float3(1.0)) * 2.0;
    float closeDust = noiseTexture.sample(noiseTextureSmplr, closeUVDust).x * 0.5;
    float midDust = noiseTexture.sample(noiseTextureSmplr, midUVDust).x * 0.20000000298023223876953125;
    float param_29 = powr(noiseTexture.sample(noiseTextureSmplr, closeUV).y, 0.4544999897480010986328125);
    float param_30 = speedAsPercent;
    float closeTrail = fast::clamp(histogramScan(param_29, param_30), 0.0, 1.0);
    float param_31 = powr(noiseTexture.sample(noiseTextureSmplr, midUV).y, 0.4544999897480010986328125);
    float param_32 = speedAsPercent * 0.75;
    float midTrail = histogramScan(param_31, param_32);
    float closeSpeck = noiseTexture.sample(noiseTextureSmplr, closeUV).z;
    float midSpeck = noiseTexture.sample(noiseTextureSmplr, midUV).z;
    float3 mixDust = powr(fast::clamp(mix(float3(closeDust) * float3(0.968599975109100341796875, 0.917599976062774658203125, 0.749000012874603271484375), float3(midDust) * float3(1.0, 1.0, 0.89999997615814208984375), float3(0.5)) * float3(1.0), float3(0.0), float3(1.0)), float3(0.681749999523162841796875));
    mixDust *= ((float3(0.85490000247955322265625, 0.8471000194549560546875, 0.81959998607635498046875) * fast::min(_66.zoom / 2.0, 0.5)) * 3.0);
    float3 mixSpeck = (float3(closeSpeck) * float3(0.4783999919891357421875, 0.46270000934600830078125, 0.43529999256134033203125)) * (0.5 + (speedAsPercent / 2.0));
    float3 trailColor = float3(0.894100010395050048828125, 0.858799993991851806640625, 0.780399978160858154296875);
    mixSpeck = fast::clamp(mix(mixSpeck, mixSpeck + (float3(closeTrail) * trailColor), float3(1.0)) * float3(randomSpeckMask), float3(0.0), float3(1.0)) * 0.5;
    float3 mixFarSpeck = (float3(midSpeck) * float3(0.4941000044345855712890625, 0.474500000476837158203125, 0.4471000134944915771484375)) * (0.5 + (speedAsPercent / 2.0));
    mixFarSpeck = fast::clamp(mix(mixFarSpeck, mixFarSpeck + (float3(midTrail) * float3(1.0)), float3(1.0)) * float3(randomSpeckMask3), float3(0.0), float3(1.0)) * 0.5;
    out.fragColor = powr(float4(((((mixSpeck + mixFarSpeck) * 2.0) + mixDust) + highSpeedSpeck) * fast::clamp(_66.zoom * 2.0, 0.300000011920928955078125, 0.800000011920928955078125), (fast::clamp((mixSpeck + mixFarSpeck) + highSpeedSpeck, float3(0.0), float3(1.0)) + (mixDust * 2.0)).x), float4(1.0));
    out.fragColor *= fast::clamp(((1.0 - _66.zoom) * 2.0) + 0.300000011920928955078125, 0.300000011920928955078125, 1.0);
    out.fragColor *= _66.daytimeAlpha;
    float debug;
    return out;
}

