#version 330

layout(std140) uniform LightningProperties
{
    mat4 mvp;
    vec4 initialColor;
    float distortion;
    float initialThickness;
    float power;
    float time;
} _19;

layout(location = 0) in vec2 position;
out vec2 vPosition;
out vec2 vUV;
layout(location = 1) in vec2 uv;
out float vIntensity;
layout(location = 2) in float intensity;

void main()
{
    gl_Position = _19.mvp * vec4(position, 0.0, 1.0);
    vPosition = position;
    vUV = uv;
    vIntensity = intensity;
}

