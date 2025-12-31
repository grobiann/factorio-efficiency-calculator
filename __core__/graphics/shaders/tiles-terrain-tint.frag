#version 330

layout(std140) uniform EffectUniforms
{
    vec2 pixelShift;
    vec2 mapPosition;
    float zoom;
    float daytimeAlphaButDoNotUseIt;
    vec2 renderResolution;
    vec4 offset;
    vec4 intensity;
    vec4 scaleU;
    vec4 scaleV;
    float globalIntensity;
    float globalScale;
    float zoomFactor;
    float zoomIntensity;
} _27;

uniform sampler2D noiseTexture;

layout(location = 0) out vec4 fragColor;
vec2 map_Position;
vec2 adjustedUV;
vec2 uv;

vec4 _textureOffset(sampler2D textureInput, vec2 uv_1, float offset, float scaleU, float scaleV)
{
    vec4 outputTexture = texture(textureInput, vec2((uv_1.x + offset) * scaleU, (uv_1.y + offset) * scaleV));
    return outputTexture;
}

void main()
{
    map_Position = (_27.mapPosition + (gl_FragCoord.xy / vec2(32.0 * _27.zoom))) * 32.0;
    adjustedUV = map_Position / vec2(1024.0);
    uv = adjustedUV;
    vec2 param = uv;
    float param_1 = _27.offset.x;
    float param_2 = _27.scaleU.x * _27.globalScale;
    float param_3 = _27.scaleV.x * _27.globalScale;
    float redTint = clamp(_textureOffset(noiseTexture, param, param_1, param_2, param_3).x, 0.0, 1.0);
    vec2 param_4 = uv;
    float param_5 = _27.offset.y;
    float param_6 = _27.scaleU.y * _27.globalScale;
    float param_7 = _27.scaleV.y * _27.globalScale;
    float greenTint = clamp(_textureOffset(noiseTexture, param_4, param_5, param_6, param_7).y, 0.0, 1.0);
    vec2 param_8 = uv;
    float param_9 = _27.offset.z;
    float param_10 = _27.scaleU.z * _27.globalScale;
    float param_11 = _27.scaleV.z * _27.globalScale;
    float blueTint = clamp(_textureOffset(noiseTexture, param_8, param_9, param_10, param_11).z, 0.0, 1.0);
    vec2 param_12 = uv;
    float param_13 = _27.offset.w;
    float param_14 = _27.scaleU.w * _27.globalScale;
    float param_15 = _27.scaleV.w * _27.globalScale;
    float Tint = clamp(_textureOffset(noiseTexture, param_12, param_13, param_14, param_15).y, 0.0, 1.0);
    vec2 param_16 = uv;
    float param_17 = _27.offset.x;
    float param_18 = (_27.scaleU.x * _27.globalScale) * _27.zoomFactor;
    float param_19 = (_27.scaleV.x * _27.globalScale) * _27.zoomFactor;
    float redTint_half = clamp(_textureOffset(noiseTexture, param_16, param_17, param_18, param_19).x, 0.0, 1.0);
    vec2 param_20 = uv;
    float param_21 = _27.offset.y;
    float param_22 = (_27.scaleU.y * _27.globalScale) * _27.zoomFactor;
    float param_23 = (_27.scaleV.y * _27.globalScale) * _27.zoomFactor;
    float greenTint_half = clamp(_textureOffset(noiseTexture, param_20, param_21, param_22, param_23).y, 0.0, 1.0);
    vec2 param_24 = uv;
    float param_25 = _27.offset.z;
    float param_26 = (_27.scaleU.z * _27.globalScale) * _27.zoomFactor;
    float param_27 = (_27.scaleV.z * _27.globalScale) * _27.zoomFactor;
    float blueTint_half = clamp(_textureOffset(noiseTexture, param_24, param_25, param_26, param_27).z, 0.0, 1.0);
    vec2 param_28 = uv;
    float param_29 = _27.offset.w;
    float param_30 = (_27.scaleU.w * _27.globalScale) * _27.zoomFactor;
    float param_31 = (_27.scaleV.w * _27.globalScale) * _27.zoomFactor;
    float Tint_half = clamp(_textureOffset(noiseTexture, param_28, param_29, param_30, param_31).y, 0.0, 1.0);
    float zoom_mult = clamp(_27.zoom * 1.0, 0.0, 1.0);
    blueTint = mix((blueTint * _27.intensity.z) * _27.globalIntensity, ((blueTint_half * _27.intensity.z) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    redTint = mix((redTint * _27.intensity.x) * _27.globalIntensity, ((redTint_half * _27.intensity.x) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    greenTint = mix((greenTint * _27.intensity.y) * _27.globalIntensity, ((greenTint_half * _27.intensity.y) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    Tint = mix((Tint * _27.intensity.w) * _27.globalIntensity, ((Tint_half * _27.intensity.w) * _27.globalIntensity) * _27.zoomIntensity, zoom_mult);
    vec4 color = vec4(1.0 - max(max(blueTint, greenTint), Tint), 1.0 - max(max(blueTint, redTint), Tint), 1.0 - max(max(greenTint, redTint), Tint), 1.0);
    fragColor = color;
}

