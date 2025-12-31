#version 330

layout(std140) uniform fsConstants
{
    mat4 colorMatrix;
    float brightness;
    float contrast;
    float saturation;
    float factor;
    float summand;
} _137;

uniform sampler2D source;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;

mat3 saturationMatrix(float saturation)
{
    vec3 luminance = vec3(0.308600008487701416015625, 0.609399974346160888671875, 0.08200000226497650146484375);
    float oneMinusSat = 1.0 - saturation;
    vec3 red = vec3(luminance.x * oneMinusSat);
    red.x += saturation;
    vec3 green = vec3(luminance.y * oneMinusSat);
    green.y += saturation;
    vec3 blue = vec3(luminance.z * oneMinusSat);
    blue.z += saturation;
    return mat3(vec3(red), vec3(green), vec3(blue));
}

void brightnessAdjust(inout vec4 color, float b)
{
    vec4 _92 = color;
    vec3 _98 = pow(max(vec3(0.0), _92.xyz), vec3(1.0 - b));
    color.x = _98.x;
    color.y = _98.y;
    color.z = _98.z;
}

void contrastAdjust(inout vec4 color, float c)
{
    float t = 0.5 - (c * 0.5);
    vec4 _110 = color;
    vec3 _116 = (_110.xyz * c) + vec3(t);
    color.x = _116.x;
    color.y = _116.y;
    color.z = _116.z;
}

void main()
{
    vec4 color = texture(source, vUV);
    vec4 _143 = color;
    vec3 _153 = clamp(_137.colorMatrix * vec4(_143.xyz, 1.0), vec4(0.0), vec4(1.0)).xyz;
    color.x = _153.x;
    color.y = _153.y;
    color.z = _153.z;
    if (_137.saturation != 1.0)
    {
        float param = _137.saturation;
        vec4 _172 = color;
        vec3 _174 = saturationMatrix(param) * _172.xyz;
        color.x = _174.x;
        color.y = _174.y;
        color.z = _174.z;
    }
    vec4 param_1 = color;
    float param_2 = _137.brightness;
    brightnessAdjust(param_1, param_2);
    color = param_1;
    vec4 param_3 = color;
    float param_4 = _137.contrast;
    contrastAdjust(param_3, param_4);
    color = param_3;
    fragColor = color;
}

