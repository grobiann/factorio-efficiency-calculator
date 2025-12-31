#version 330

layout(std140) uniform fsConstants
{
    vec2 zoom_to_world_params;
    float timer;
    float lutSize;
    vec2 resolution;
    float unused_was_lutAlpha;
    float lightMul;
    float lightAdd;
    uint debugShowLut;
} _92;

uniform sampler2D gameview;
uniform sampler3D sunLut;
uniform sampler3D lightLut;
uniform sampler2D lightmap;
uniform sampler2D detailLightmap;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;

vec3 colorToLut16Index(vec3 inputColor)
{
    return (inputColor * 0.9375) + vec3(0.03125);
}

void main()
{
    vec2 uv = vUV;
    vec4 color = texture(gameview, uv);
    vec3 param = color.xyz;
    vec3 lookupIndex = colorToLut16Index(param);
    vec4 sunlitColor = vec4(textureLod(sunLut, lookupIndex, 0.0).xyz, color.w);
    vec4 artificiallyLitColor = vec4(textureLod(lightLut, lookupIndex, 0.0).xyz, color.w);
    vec4 light = texture(lightmap, uv) + texture(detailLightmap, uv);
    light = clamp(light, vec4(0.0), vec4(1.0));
    vec4 _88 = light;
    vec3 _104 = (_88.xyz * vec3(_92.lightMul)) + vec3(_92.lightAdd);
    light.x = _104.x;
    light.y = _104.y;
    light.z = _104.z;
    vec4 finalColor = mix(sunlitColor, artificiallyLitColor, light);
    fragColor = finalColor;
}

