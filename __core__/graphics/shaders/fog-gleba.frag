#version 330

layout(std140) uniform FogEffectUniforms
{
    vec2 renderResolution;
    vec2 unused_TexSize;
    vec2 pixelShift;
    vec2 mapPosition;
    float zoom;
    uint debugOption;
    vec2 cloudsOffset;
    vec4 color1;
    vec4 color2;
    float animationSpeed;
    float animationScale;
    float sunLightIntensity;
    float renderScale;
    uint uTick;
    float tickFactor;
    vec2 scaledTime;
    float timeBasedRandomValue;
    float fracScaledTime;
    vec2 sinCosTimeHalf;
} _46;

uniform sampler2D noiseTexture;
uniform sampler2D detailTexture;
uniform sampler2D lightmap;
uniform sampler2D fogMask;

flat in vec4 vCornerIntensities;
in vec2 vCellUV;
layout(location = 0) out vec4 fragColor;
flat in vec3 vColor;
flat in mat4 vCubicCoeffs;
float globalScale;
float noiseTexScale;
float detailTexScale;
float timeRandom;
vec2 adjustedCloudsOffset;
vec4 direction1;
vec4 direction2;
vec4 direction3;
float warpIntensity;
float panScale;
vec2 adjustedMapPosition;
vec2 adjustedUV;
vec2 uv;
vec2 noise_uv;
float speedbase;
vec4 windRotationMask;
vec4 windRotationMask2;
float Udir;
float Vdir;
float Udir2;
float Vdir2;

vec4 PanningTexture(vec2 uv_1, float speedX, float speedY, sampler2D textureInput)
{
    vec2 uvDist = ((uv_1 * 2.0) + vec2(_46.fracScaledTime)) + (_46.sinCosTimeHalf.yx / vec2(speedX, speedY));
    vec4 pannerOut = texture(textureInput, uvDist);
    return pannerOut;
}

vec4 combineColorAndLight(vec4 color, vec4 light)
{
    return vec4(clamp(color.xyz * (color.xyz + max(light.xyz, vec3(0.0))), vec3(0.0), vec3(1.0)), 1.0);
}

vec4 cloudsFunction(vec2 offset, float speed)
{
    float globalSpeed = 1.0 * speed;
    float noisePanSpeed = 50.0 * globalSpeed;
    float globalPanSpeed = 100.0 * globalSpeed;
    float detailPanSpeed = 0.100000001490116119384765625 * globalSpeed;
    vec2 param = (noise_uv * noiseTexScale) + offset;
    float param_1 = Udir * noisePanSpeed;
    float param_2 = Vdir * noisePanSpeed;
    vec4 noise_1 = PanningTexture(param, param_1, param_2, noiseTexture);
    vec2 param_3 = (noise_uv * noiseTexScale) + offset;
    float param_4 = Udir2 * noisePanSpeed;
    float param_5 = Vdir2 * noisePanSpeed;
    vec4 noise_2 = PanningTexture(param_3, param_4, param_5, noiseTexture);
    vec2 appendUvs1 = vec2(noise_1.x, noise_2.y) * (warpIntensity * 50.0);
    vec2 appendUvs2 = vec2(noise_1.y, noise_2.x) * (warpIntensity * 100.0);
    vec2 appendUvs = mix(appendUvs1, appendUvs2, vec2((_46.sinCosTimeHalf.x * _46.sinCosTimeHalf.y) * 2.0));
    vec2 warpMix = mix(appendUvs, (adjustedUV * 0.4000000059604644775390625) + offset, vec2(0.4000000059604644775390625));
    vec2 param_6 = ((warpMix * 2.0) * globalScale) + offset;
    float param_7 = Udir2 * globalPanSpeed;
    float param_8 = Vdir2 * globalPanSpeed;
    vec4 globalPan = PanningTexture(param_6, param_7, param_8, detailTexture);
    vec2 param_9 = (noise_uv * detailTexScale) + offset;
    float param_10 = Udir / (detailPanSpeed * detailTexScale);
    float param_11 = Vdir / (detailPanSpeed * detailTexScale);
    vec4 noiseOverlay1 = PanningTexture(param_9, param_10, param_11, detailTexture);
    vec2 param_12 = (noise_uv * detailTexScale) + offset;
    float param_13 = Udir2 / (detailPanSpeed * detailTexScale);
    float param_14 = Vdir2 / (detailPanSpeed * detailTexScale);
    vec4 noiseOverlay2 = PanningTexture(param_12, param_13, param_14, detailTexture);
    vec4 noiseOverlay = mix(noiseOverlay1, noiseOverlay2, vec4(windRotationMask.y));
    globalPan = clamp(globalPan - vec4(0.5), vec4(0.0), vec4(1.0)) * 2.0;
    vec4 outputTexture = clamp(mix(globalPan * noiseOverlay, globalPan, vec4(0.300000011920928955078125)), vec4(0.0), vec4(1.0));
    return outputTexture;
}

float calculateLowlandIntensityBilinear()
{
    float intensity = mix(mix(vCornerIntensities.x, vCornerIntensities.y, vCellUV.x), mix(vCornerIntensities.z, vCornerIntensities.w, vCellUV.x), vCellUV.y);
    return smoothstep(0.0, 0.75, intensity);
}

void main()
{
    globalScale = 0.100000001490116119384765625;
    noiseTexScale = 0.1500000059604644775390625;
    detailTexScale = 1.2000000476837158203125;
    timeRandom = _46.timeBasedRandomValue;
    adjustedCloudsOffset = clamp(vec2(_46.cloudsOffset.x, _46.cloudsOffset.y), vec2(-3000.0), vec2(2000.0));
    direction1 = vec4(adjustedCloudsOffset.x * 0.5, adjustedCloudsOffset.y * 1.5, 0.0, 0.0);
    direction2 = vec4(adjustedCloudsOffset.x, adjustedCloudsOffset.y, 0.0, 0.0);
    direction3 = vec4(0.03125, 0.007610999979078769683837890625, 0.02798300050199031829833984375, 0.0);
    warpIntensity = 0.0074999998323619365692138671875 / globalScale;
    panScale = 2.0;
    adjustedMapPosition = (((vec2(gl_FragCoord.xy) / vec2(_46.renderScale)) + _46.pixelShift) / vec2(32.0 * _46.zoom)) * 32.0;
    adjustedUV = (adjustedMapPosition + adjustedCloudsOffset) / vec2(1024.0);
    uv = adjustedUV + vec2(10.0);
    noise_uv = uv * panScale;
    speedbase = 0.5 * _46.animationSpeed;
    vec2 param = uv / vec2(100.0);
    float param_1 = adjustedCloudsOffset.x;
    float param_2 = adjustedCloudsOffset.y;
    windRotationMask = PanningTexture(param, param_1, param_2, noiseTexture);
    vec2 param_3 = (uv / vec2(100.0)) + vec2(0.20000000298023223876953125);
    float param_4 = adjustedCloudsOffset.x;
    float param_5 = adjustedCloudsOffset.y;
    windRotationMask2 = PanningTexture(param_3, param_4, param_5, noiseTexture);
    Udir = speedbase / direction1.x;
    Vdir = speedbase / direction1.y;
    Udir2 = speedbase / direction2.x;
    Vdir2 = speedbase / direction2.y;
    vec4 light = texture(lightmap, vec2(gl_FragCoord.xy) / (_46.renderResolution / vec2(_46.renderScale)));
    vec4 color_1 = _46.color1;
    vec4 color_2 = _46.color2;
    float intensity = clamp(timeRandom, 0.4000000059604644775390625, 0.5) * 0.60000002384185791015625;
    vec4 param_6 = color_1;
    vec4 param_7 = light;
    vec2 param_8 = vec2(0.0);
    float param_9 = 1.0;
    vec4 fogTexture1 = (combineColorAndLight(param_6, param_7) * mix(cloudsFunction(param_8, param_9).x, 0.800000011920928955078125, 0.300000011920928955078125)) * intensity;
    vec4 param_10 = color_2;
    vec4 param_11 = light;
    vec2 param_12 = vec2(0.0500000007450580596923828125);
    float param_13 = 0.25;
    vec4 fogTexture2 = ((combineColorAndLight(param_10, param_11) * mix(cloudsFunction(param_12, param_13).x, 0.800000011920928955078125, 0.300000011920928955078125)) * intensity) * 0.5;
    float mask = 1.0 - texture(fogMask, vec2(gl_FragCoord.xy) / _46.renderResolution).w;
    fragColor = ((fogTexture1 + fogTexture2) * mask) * calculateLowlandIntensityBilinear();
}

