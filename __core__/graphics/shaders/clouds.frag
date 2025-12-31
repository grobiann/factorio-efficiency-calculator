#version 330

layout(std140) uniform EffectUniforms
{
    float cloudMovementMultiplier;
    float debugValue;
    uint debugOption;
    float tick;
    vec2 pixelShift;
    vec2 mapPosition;
    float zoom;
    float daytimeAlpha;
    vec2 renderResolution;
    vec2 cloudsOffset;
    vec2 windVector;
    vec2 minWarpNoiseUV1;
    vec2 maxWarpNoiseUV1;
    vec2 minWarpNoiseUV2;
    vec2 maxWarpNoiseUV2;
    vec2 minShapeNoiseUV;
    vec2 maxShapeNoiseUV;
    vec2 minAdditionalDensityNoiseUV;
    vec2 maxAdditionalDensityNoiseUV;
    vec2 minDetailNoiseUV1;
    vec2 maxDetailNoiseUV1;
    vec2 minDetailNoiseUV2;
    vec2 maxDetailNoiseUV2;
    vec2 detailTextureRandomOffset0;
    vec2 detailTextureRandomOffset1;
    float detailTextureRatio;
    float opacity;
    float warpStrength;
    float warpWeight;
    float detailFactor;
    float shapeFactor;
    float detailExponent;
    float density;
} _18;

uniform sampler2D noiseTexture;
uniform sampler2D detailTexture;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;

void main()
{
    float warpX = texture(noiseTexture, mix(_18.minWarpNoiseUV1, _18.maxWarpNoiseUV1, vUV)).x;
    float warpY = texture(noiseTexture, mix(_18.minWarpNoiseUV2, _18.maxWarpNoiseUV2, vUV)).y;
    vec2 warpUVs = vec2(warpX, warpY) * _18.warpStrength;
    vec2 warpMix = (warpUVs * _18.warpWeight) + mix(_18.minShapeNoiseUV, _18.maxShapeNoiseUV, vUV);
    float dissolvedCloudsShape = texture(noiseTexture, warpMix).z;
    if (_18.density > 0.0)
    {
        vec2 warpMix2 = (warpUVs * _18.warpWeight) + mix(_18.minAdditionalDensityNoiseUV, _18.maxAdditionalDensityNoiseUV, vUV);
        float moreCloud = texture(noiseTexture, warpMix2 + vec2(1.70899999141693115234375, 2.17899990081787109375)).z;
        float d = 1.0 - pow(abs(1.0 - _18.density), 3.0);
        dissolvedCloudsShape = min(dissolvedCloudsShape, mix(1.0, moreCloud, d));
    }
    float cloudDetail1 = texture(detailTexture, mix(_18.minDetailNoiseUV1, _18.maxDetailNoiseUV1, vUV) + _18.detailTextureRandomOffset0).x;
    float cloudDetail2 = texture(detailTexture, mix(_18.minDetailNoiseUV2, _18.maxDetailNoiseUV2, vUV) + _18.detailTextureRandomOffset1).x;
    float cloudDetail = mix(cloudDetail1, cloudDetail2, _18.detailTextureRatio);
    float softClouds = clamp((cloudDetail * _18.detailFactor) + (_18.shapeFactor * dissolvedCloudsShape), 0.0, 1.0);
    float finalCloudOpacity = mix(softClouds - pow(abs(cloudDetail), _18.detailExponent), softClouds, softClouds);
    fragColor = vec4(0.0, 0.0, 0.0, finalCloudOpacity * _18.opacity);
}

