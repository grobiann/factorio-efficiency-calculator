#version 330

struct CellUVs
{
    vec2 uvs;
    vec2 randomValue;
    float rotationAngle;
    bool clamped;
};

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
} _185;

uniform sampler2D asteroidTexture;
uniform sampler2D asteroidNormalTexture;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;

vec4 createSamplingUvs(vec2 uv)
{
    vec2 integerUvs = floor(uv);
    vec2 repeatingUvs = uv - integerUvs;
    return vec4(repeatingUvs, integerUvs);
}

vec2 random2(vec2 st)
{
    vec2 s = vec2(dot(st, vec2(12.345600128173828125, 34.141498565673828125)), dot(st, vec2(42.21540069580078125, 15.285400390625)));
    return fract(sin(s) * 45678.8984375);
}

vec2 rotateUV(vec2 uv, float angle, vec2 pivot)
{
    vec2 offsetUv = uv - pivot;
    float angleCos = cos(angle);
    float angleSin = sin(angle);
    return vec2((offsetUv.x * angleCos) - (offsetUv.y * angleSin), (offsetUv.x * angleSin) + (offsetUv.y * angleCos)) + pivot;
}

float cheapContrast(float value, float threshold)
{
    return clamp((value - threshold) * (1.0 / threshold), 0.0, 1.0);
}

vec2 scaleUvWithOffset(vec2 uv, float scale, vec2 offset)
{
    return ((uv - offset) * scale) + offset;
}

CellUVs offsetRandomUvs(vec2 inputUv, vec2 integerUv, vec2 offset, float subUv, float scale, float rotSpeed)
{
    vec2 modUv = integerUv + offset;
    vec2 param = modUv;
    CellUVs result;
    result.randomValue = random2(param);
    vec2 randomUvIndex = floor(result.randomValue * subUv);
    vec2 offsetUvs = (inputUv - offset) - result.randomValue;
    vec2 randomOffsetUvs = offsetUvs + randomUvIndex;
    result.rotationAngle = (((_185.time / rotSpeed) * (result.randomValue.x - 0.25)) * 2.0) + result.randomValue.y;
    vec2 param_1 = randomOffsetUvs;
    float param_2 = result.rotationAngle;
    vec2 param_3 = randomUvIndex + vec2(0.5);
    vec2 rotatedUvs = rotateUV(param_1, param_2, param_3);
    float param_4 = result.randomValue.y;
    float param_5 = 0.699999988079071044921875;
    float scaleValue = (scale * 1.0) / clamp(cheapContrast(param_4, param_5) * 4.0, 9.9999997473787516355514526367188e-05, 1.0);
    vec2 param_6 = rotatedUvs;
    float param_7 = scaleValue;
    vec2 param_8 = randomUvIndex + vec2(0.5);
    vec2 scaleUvs = scaleUvWithOffset(param_6, param_7, param_8);
    vec2 clampWrappingUvs = clamp(scaleUvs, randomUvIndex, randomUvIndex + vec2(1.0));
    result.clamped = any(notEqual(clampWrappingUvs, scaleUvs));
    result.uvs = clampWrappingUvs * (1.0 / subUv);
    return result;
}

void sampleRandomCell(vec2 inputUv, vec2 integerUv, sampler2D image, float subUv, float scale, float rotSpeed, out vec4 sampledTexture, out float rotationAngle, out vec2 randomValue)
{
    vec2 param = inputUv;
    vec2 param_1 = integerUv;
    vec2 param_2 = vec2(0.0);
    float param_3 = subUv;
    float param_4 = scale;
    float param_5 = rotSpeed;
    CellUVs centerParams = offsetRandomUvs(param, param_1, param_2, param_3, param_4, param_5);
    vec2 param_6 = inputUv;
    vec2 param_7 = integerUv;
    vec2 param_8 = vec2(0.0, -1.0);
    float param_9 = subUv;
    float param_10 = scale;
    float param_11 = rotSpeed;
    CellUVs aboveParams = offsetRandomUvs(param_6, param_7, param_8, param_9, param_10, param_11);
    vec2 param_12 = inputUv;
    vec2 param_13 = integerUv;
    vec2 param_14 = vec2(-1.0, 0.0);
    float param_15 = subUv;
    float param_16 = scale;
    float param_17 = rotSpeed;
    CellUVs leftParams = offsetRandomUvs(param_12, param_13, param_14, param_15, param_16, param_17);
    vec2 param_18 = inputUv;
    vec2 param_19 = integerUv;
    vec2 param_20 = vec2(-1.0);
    float param_21 = subUv;
    float param_22 = scale;
    float param_23 = rotSpeed;
    CellUVs aboveLeftParams = offsetRandomUvs(param_18, param_19, param_20, param_21, param_22, param_23);
    vec4 _322;
    if (centerParams.clamped)
    {
        _322 = vec4(0.0);
    }
    else
    {
        _322 = texture(image, centerParams.uvs);
    }
    vec4 center = _322;
    vec4 _335;
    if (aboveParams.clamped)
    {
        _335 = vec4(0.0);
    }
    else
    {
        _335 = texture(image, aboveParams.uvs);
    }
    vec4 above = _335;
    vec4 _347;
    if (leftParams.clamped)
    {
        _347 = vec4(0.0);
    }
    else
    {
        _347 = texture(image, leftParams.uvs);
    }
    vec4 left = _347;
    vec4 _359;
    if (aboveLeftParams.clamped)
    {
        _359 = vec4(0.0);
    }
    else
    {
        _359 = texture(image, aboveLeftParams.uvs);
    }
    vec4 aboveLeft = _359;
    randomValue = mix(mix(mix(centerParams.randomValue, aboveParams.randomValue, vec2(above.w)), leftParams.randomValue, vec2(left.w)), aboveLeftParams.randomValue, vec2(aboveLeft.w));
    rotationAngle = mix(mix(mix(mix(0.0, centerParams.rotationAngle, center.w), aboveParams.rotationAngle, above.w), leftParams.rotationAngle, left.w), aboveLeftParams.rotationAngle, aboveLeft.w);
    sampledTexture = vec4(mix(mix(mix(center.xyz, above.xyz, vec3(above.w)), left.xyz, vec3(left.w)), aboveLeft.xyz, vec3(aboveLeft.w)), clamp(((center.w + left.w) + above.w) + aboveLeft.w, 0.0, 1.0));
}

void main()
{
    vec2 mapPosition = (_185.letfTopMapPosition + ((vUV * _185.resolution) / vec2(32.0 * _185.zoom))) * 32.0;
    mapPosition += _185.platformOffset;
    vec2 uv = mapPosition / vec2(1536.0);
    vec2 vUV2 = vUV;
    vec2 vUV_1 = uv;
    uv /= vec2(2.0);
    float subTileCount = 4.0;
    float asteroidScale = 4.400000095367431640625;
    float globalTiling = 2.0;
    float asteroidSpeed = 2.2999999523162841796875;
    vec2 tileUvs = (vUV_1 * globalTiling) + min(vec2(0.0, (_185.platformOffset.y / ((subTileCount * asteroidSpeed) * asteroidScale)) - ((_185.time / asteroidSpeed) / 1000.0)), vec2(-0.00999999977648258209228515625));
    tileUvs *= subTileCount;
    vec2 integerUvs = floor(tileUvs);
    vec2 repeatingUvs = tileUvs - integerUvs;
    float rotation_speed = 250.0;
    vec2 param = tileUvs + vec2(0.0, _185.time / 500.0);
    vec4 bottomLayerUvs = createSamplingUvs(param);
    vec2 param_1 = repeatingUvs;
    vec2 param_2 = integerUvs;
    float param_3 = subTileCount;
    float param_4 = asteroidScale / globalTiling;
    float param_5 = rotation_speed * 0.75;
    vec4 param_6;
    float param_7;
    vec2 param_8;
    sampleRandomCell(param_1, param_2, asteroidTexture, param_3, param_4, param_5, param_6, param_7, param_8);
    vec4 asteroidTopLayer = param_6;
    float asteroidTopLayerRotation = param_7;
    vec2 asteroidTopLayerRandom = param_8;
    vec2 param_9 = bottomLayerUvs.xy;
    vec2 param_10 = bottomLayerUvs.zw;
    float param_11 = subTileCount;
    float param_12 = ((asteroidScale / 1.25) * 2.0) / globalTiling;
    float param_13 = rotation_speed;
    vec4 param_14;
    float param_15;
    vec2 param_16;
    sampleRandomCell(param_9, param_10, asteroidTexture, param_11, param_12, param_13, param_14, param_15, param_16);
    vec4 asteroidMidLayer = param_14;
    float asteroidMidLayerRotation = param_15;
    vec2 asteroidMidLayerRandom = param_16;
    float randomBrightness = max(0.4000000059604644775390625, 0.5 + mix(asteroidMidLayerRandom, asteroidTopLayerRandom, vec2(asteroidTopLayer.w)).x);
    vec2 param_17 = repeatingUvs;
    vec2 param_18 = integerUvs;
    float param_19 = subTileCount;
    float param_20 = asteroidScale / globalTiling;
    float param_21 = rotation_speed * 0.75;
    vec4 param_22;
    float param_23;
    vec2 param_24;
    sampleRandomCell(param_17, param_18, asteroidNormalTexture, param_19, param_20, param_21, param_22, param_23, param_24);
    vec4 asteroidTopLayerNormal = param_22;
    float asteroidTopLayerNormalRotation = param_23;
    vec2 normalRandom_throwaway = param_24;
    vec2 param_25 = bottomLayerUvs.xy;
    vec2 param_26 = bottomLayerUvs.zw;
    float param_27 = subTileCount;
    float param_28 = ((asteroidScale / 1.25) * 2.0) / globalTiling;
    float param_29 = rotation_speed;
    vec4 param_30;
    float param_31;
    vec2 param_32;
    sampleRandomCell(param_25, param_26, asteroidNormalTexture, param_27, param_28, param_29, param_30, param_31, param_32);
    vec4 asteroidMidLayerNormal = param_30;
    float asteroidMidLayerNormalRotation = param_31;
    normalRandom_throwaway = param_32;
    float asteroidAlpha = clamp(asteroidMidLayer.w + (asteroidTopLayer.w * 10.0), 0.0, 1.0);
    vec4 ambientLight = vec4(mix(asteroidMidLayer.xyz * 0.12999999523162841796875, asteroidTopLayer.xyz * 0.23000000417232513427734375, vec3(asteroidTopLayer.w)) * randomBrightness, asteroidAlpha);
    vec4 litColour = vec4(mix(asteroidMidLayer.xyz * 0.17000000178813934326171875, asteroidTopLayer.xyz * 0.2700000107288360595703125, vec3(asteroidTopLayer.w)) * randomBrightness, asteroidAlpha);
    vec4 normal_img = mix(asteroidMidLayerNormal, asteroidTopLayerNormal, vec4(asteroidTopLayer.w));
    float normalRotation = mix(asteroidMidLayerNormalRotation, asteroidTopLayerNormalRotation, asteroidTopLayer.w);
    float normalStrength = 2.0;
    float lightWidth = 0.0;
    vec3 normal = normalize((normal_img.xyz * vec3(1.0, 1.0, 0.5)) - vec3(0.5, 0.5, 0.0));
    normal = normalize(vec3(0.0, 0.0, 1.0) + ((normal - vec3(0.0, 0.0, 1.0)) * normalStrength));
    vec3 rotated_normal = vec3((normal.x * cos(normalRotation)) + (normal.y * sin(normalRotation)), ((-normal.x) * sin(normalRotation)) + (normal.y * cos(normalRotation)), normal.z);
    vec3 illumination = vec3(0.0);
    vec3 lights_diffuse = vec3(0.0);
    vec3 light_color = vec3(1.0);
    vec3 light_direction = vec3(0.66564023494720458984375, 0.4992301762104034423828125, -0.554700195789337158203125);
    float lighting = max(0.0, dot(rotated_normal, -light_direction) + lightWidth);
    vec3 light_diffuse = (light_color * lighting) * 1.0;
    illumination += (light_color * max(-1.0, lighting));
    lights_diffuse += light_diffuse;
    lights_diffuse *= asteroidAlpha;
    vec4 finalColor = vec4((lights_diffuse + ambientLight.xyz) * litColour.xyz, litColour.w) * 1.0;
    fragColor = finalColor;
}

