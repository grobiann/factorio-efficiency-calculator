#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct EffectUniforms
{
    float cloudMovementMultiplier;
    float debugValue;
    uint debugOption;
    float tick;
    float2 pixelShift;
    float2 mapPosition;
    float zoom;
    float daytimeAlpha;
    float2 renderResolution;
    float2 cloudsOffset;
    float2 windVector;
    float2 minWarpNoiseUV1;
    float2 maxWarpNoiseUV1;
    float2 minWarpNoiseUV2;
    float2 maxWarpNoiseUV2;
    float2 minShapeNoiseUV;
    float2 maxShapeNoiseUV;
    float2 minAdditionalDensityNoiseUV;
    float2 maxAdditionalDensityNoiseUV;
    float2 minDetailNoiseUV1;
    float2 maxDetailNoiseUV1;
    float2 minDetailNoiseUV2;
    float2 maxDetailNoiseUV2;
    float2 detailTextureRandomOffset0;
    float2 detailTextureRandomOffset1;
    float detailTextureRatio;
    float opacity;
    float warpStrength;
    float warpWeight;
    float detailFactor;
    float shapeFactor;
    float detailExponent;
    float density;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vUV [[user(locn0)]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant EffectUniforms& _18 [[buffer(0)]], texture2d<float> noiseTexture [[texture(0)]], texture2d<float> detailTexture [[texture(1)]], sampler noiseTextureSmplr [[sampler(0)]], sampler detailTextureSmplr [[sampler(1)]])
{
    main0_out out = {};
    float warpX = noiseTexture.sample(noiseTextureSmplr, mix(_18.minWarpNoiseUV1, _18.maxWarpNoiseUV1, in.vUV)).x;
    float warpY = noiseTexture.sample(noiseTextureSmplr, mix(_18.minWarpNoiseUV2, _18.maxWarpNoiseUV2, in.vUV)).y;
    float2 warpUVs = float2(warpX, warpY) * _18.warpStrength;
    float2 warpMix = (warpUVs * _18.warpWeight) + mix(_18.minShapeNoiseUV, _18.maxShapeNoiseUV, in.vUV);
    float dissolvedCloudsShape = noiseTexture.sample(noiseTextureSmplr, warpMix).z;
    if (_18.density > 0.0)
    {
        float2 warpMix2 = (warpUVs * _18.warpWeight) + mix(_18.minAdditionalDensityNoiseUV, _18.maxAdditionalDensityNoiseUV, in.vUV);
        float moreCloud = noiseTexture.sample(noiseTextureSmplr, (warpMix2 + float2(1.70899999141693115234375, 2.17899990081787109375))).z;
        float d = 1.0 - powr(abs(1.0 - _18.density), 3.0);
        dissolvedCloudsShape = fast::min(dissolvedCloudsShape, mix(1.0, moreCloud, d));
    }
    float cloudDetail1 = detailTexture.sample(detailTextureSmplr, (mix(_18.minDetailNoiseUV1, _18.maxDetailNoiseUV1, in.vUV) + _18.detailTextureRandomOffset0)).x;
    float cloudDetail2 = detailTexture.sample(detailTextureSmplr, (mix(_18.minDetailNoiseUV2, _18.maxDetailNoiseUV2, in.vUV) + _18.detailTextureRandomOffset1)).x;
    float cloudDetail = mix(cloudDetail1, cloudDetail2, _18.detailTextureRatio);
    float softClouds = fast::clamp((cloudDetail * _18.detailFactor) + (_18.shapeFactor * dissolvedCloudsShape), 0.0, 1.0);
    float finalCloudOpacity = mix(softClouds - powr(abs(cloudDetail), _18.detailExponent), softClouds, softClouds);
    out.fragColor = float4(0.0, 0.0, 0.0, finalCloudOpacity * _18.opacity);
    return out;
}

