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
} _14;

layout(std140) uniform passParams
{
    float passTime;
} _78;

uniform sampler2D noiseTexture;

layout(location = 0) out vec4 fragColor;
vec2 map_Position;
vec2 adjustedUV;
vec2 uv;
float puddleWidth;
float puddleThreshold;
float puddleOpacity;

void main()
{
    map_Position = (_14.mapPosition + (gl_FragCoord.xy / vec2(32.0 * _14.zoom))) * 32.0;
    adjustedUV = map_Position / vec2(1024.0);
    uv = adjustedUV;
    puddleWidth = 0.07500000298023223876953125;
    puddleThreshold = 0.550000011920928955078125;
    puddleOpacity = 0.60000002384185791015625;
    float puddle = texture(noiseTexture, uv).y;
    fragColor = vec4(0.0, 1.0 - (clamp(smoothstep(puddleThreshold - puddleWidth, puddleThreshold + puddleWidth, puddle), 0.0, 1.0) * puddleOpacity), 0.0, 0.0);
}

