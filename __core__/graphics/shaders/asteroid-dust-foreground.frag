#version 330

layout(std140) uniform SpaceDustConstants
{
    vec2 letfTopMapPosition;
    vec2 pixelShift;
    vec2 backgroundCenter;
    vec2 platformOffset;
    vec2 resolution;
    float zoom;
    float daytimeAlpha;
    float time;
    float animationSpeed;
    float platformSpeed;
    float maxPlatformSpeedEstimate;
} _66;

uniform sampler2D noiseTexture;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;
float debug;

vec2 PanningUV2(vec2 uv, float speedX, float speedY, float time1)
{
    vec2 uvDist = uv;
    uvDist.x -= ((_66.time / 1000.0) * speedX);
    uvDist.y -= (time1 / 10.0);
    return fract(uvDist);
}

vec2 PanningUV(vec2 uv, float speedX, float speedY, float time1)
{
    vec2 uvDist = uv;
    uvDist.x -= fract((time1 / 1000.0) * speedX);
    uvDist.y -= fract((time1 / 1000.0) * speedY);
    return fract(uvDist);
}

float histogramSelect(float image, float position, float range)
{
    return 1.0 + (min(image - position, position - image) / range);
}

float histogramScan(float image, float position)
{
    return clamp(image - (1.0 - position), 0.0, 1.0);
}

void main()
{
    vec2 mapPosition = (_66.letfTopMapPosition + ((vUV * _66.resolution) / vec2(32.0 * _66.zoom))) * 32.0;
    mapPosition += _66.platformOffset;
    vec2 uv = mapPosition / vec2(1536.0);
    uv /= vec2(5.0);
    float maxSpeed = _66.maxPlatformSpeedEstimate;
    float parralaxScale = 0.5;
    vec2 platformOffset1 = _66.platformOffset / vec2(3.0);
    float normalizedSpeed = _66.platformSpeed;
    float trueTime = 1.0 / (normalizedSpeed / (1.0 - _66.platformOffset.y));
    platformOffset1 = vec2(platformOffset1.x, platformOffset1.y - (_66.time / 1000.0));
    float speckSpeed = _66.platformOffset.y / parralaxScale;
    float speedAsPercent = clamp(normalizedSpeed / maxSpeed, 0.0, 1.0);
    float fadePeriod = 2.0;
    vec2 closeUV = uv * 4.0;
    vec2 midUV = (uv * 4.0) / vec2(parralaxScale);
    vec2 closeUVDust = uv;
    vec2 midUVDust = uv / vec2(parralaxScale);
    vec2 param = midUV;
    float param_1 = 0.0;
    float param_2 = speckSpeed * parralaxScale;
    float param_3 = (-platformOffset1.y) * 4.0;
    midUV = PanningUV2(param, param_1, param_2, param_3);
    vec2 param_4 = closeUV;
    float param_5 = 0.0;
    float param_6 = speckSpeed;
    float param_7 = (-platformOffset1.y) * 4.0;
    vec2 panningCloseUV = PanningUV2(param_4, param_5, param_6, param_7);
    closeUV = panningCloseUV;
    vec2 param_8 = uv / vec2(2.0);
    float param_9 = 0.5;
    float param_10 = 5.0;
    float param_11 = _66.time - platformOffset1.y;
    vec2 highSpeedSpeckUV = PanningUV(param_8, param_9, param_10, param_11);
    vec3 highSpeedSpeck = vec3(texture(noiseTexture, highSpeedSpeckUV).y) * 0.0;
    vec2 param_12 = midUVDust;
    float param_13 = 0.0;
    float param_14 = normalizedSpeed * parralaxScale;
    float param_15 = -platformOffset1.y;
    midUVDust = PanningUV2(param_12, param_13, param_14, param_15);
    vec2 param_16 = closeUVDust;
    float param_17 = 0.0;
    float param_18 = normalizedSpeed;
    float param_19 = -platformOffset1.y;
    closeUVDust = PanningUV2(param_16, param_17, param_18, param_19);
    float speckMask = texture(noiseTexture, closeUV).w;
    float fadeMask = sin(platformOffset1.y / 2.0);
    float fadeTime = (fadeMask + 4.0) / 8.0;
    float param_20 = speckMask;
    float param_21 = fadeTime;
    float param_22 = 0.0500000007450580596923828125;
    float randomSpeckMask = clamp(histogramSelect(param_20, param_21, param_22), 0.0, 1.0);
    float param_23 = speckMask;
    float param_24 = fadeTime;
    float param_25 = 0.0500000007450580596923828125;
    float randomSpeckMask3 = clamp(histogramSelect(param_23, param_24, param_25), 0.0, 1.0);
    float param_26 = speckMask;
    float param_27 = fadeTime;
    float param_28 = 0.004999999888241291046142578125;
    float randomSpeckMask2 = clamp(histogramSelect(param_26, param_27, param_28), 0.0, 1.0);
    highSpeedSpeck = clamp(highSpeedSpeck * randomSpeckMask2, vec3(0.0), vec3(1.0)) * 2.0;
    float closeDust = texture(noiseTexture, closeUVDust).x * 0.5;
    float midDust = texture(noiseTexture, midUVDust).x * 0.20000000298023223876953125;
    float param_29 = pow(texture(noiseTexture, closeUV).y, 0.4544999897480010986328125);
    float param_30 = speedAsPercent;
    float closeTrail = clamp(histogramScan(param_29, param_30), 0.0, 1.0);
    float param_31 = pow(texture(noiseTexture, midUV).y, 0.4544999897480010986328125);
    float param_32 = speedAsPercent * 0.75;
    float midTrail = histogramScan(param_31, param_32);
    float closeSpeck = texture(noiseTexture, closeUV).z;
    float midSpeck = texture(noiseTexture, midUV).z;
    vec3 mixDust = pow(clamp(mix(vec3(closeDust) * vec3(0.968599975109100341796875, 0.917599976062774658203125, 0.749000012874603271484375), vec3(midDust) * vec3(1.0, 1.0, 0.89999997615814208984375), vec3(0.5)) * vec3(1.0), vec3(0.0), vec3(1.0)), vec3(0.681749999523162841796875));
    mixDust *= ((vec3(0.85490000247955322265625, 0.8471000194549560546875, 0.81959998607635498046875) * min(_66.zoom / 2.0, 0.5)) * 3.0);
    vec3 mixSpeck = (vec3(closeSpeck) * vec3(0.4783999919891357421875, 0.46270000934600830078125, 0.43529999256134033203125)) * (0.5 + (speedAsPercent / 2.0));
    vec3 trailColor = vec3(0.894100010395050048828125, 0.858799993991851806640625, 0.780399978160858154296875);
    mixSpeck = clamp(mix(mixSpeck, mixSpeck + (vec3(closeTrail) * trailColor), vec3(1.0)) * vec3(randomSpeckMask), vec3(0.0), vec3(1.0)) * 0.5;
    vec3 mixFarSpeck = (vec3(midSpeck) * vec3(0.4941000044345855712890625, 0.474500000476837158203125, 0.4471000134944915771484375)) * (0.5 + (speedAsPercent / 2.0));
    mixFarSpeck = clamp(mix(mixFarSpeck, mixFarSpeck + (vec3(midTrail) * vec3(1.0)), vec3(1.0)) * vec3(randomSpeckMask3), vec3(0.0), vec3(1.0)) * 0.5;
    fragColor = pow(vec4(((((mixSpeck + mixFarSpeck) * 2.0) + mixDust) + highSpeedSpeck) * clamp(_66.zoom * 2.0, 0.300000011920928955078125, 0.800000011920928955078125), (clamp((mixSpeck + mixFarSpeck) + highSpeedSpeck, vec3(0.0), vec3(1.0)) + (mixDust * 2.0)).x), vec4(1.0));
    fragColor *= clamp(((1.0 - _66.zoom) * 2.0) + 0.300000011920928955078125, 0.300000011920928955078125, 1.0);
    fragColor *= _66.daytimeAlpha;
}

