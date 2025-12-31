#version 330

struct Light
{
    vec4 color;
    vec4 direction;
};

layout(std140) uniform AsteroidConstants
{
    float normalStrength;
    float lightWidth;
    float brightness;
    float specularStrength;
    float specPower;
    float specPurity;
    float SSSContrast;
    float SSSAmount;
    Light lights[4];
    vec4 ambientLight;
    int flags;
} _78;

uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D roughnessMap;

in vec2 vDiffuseUV;
in vec2 vNormalUV;
in vec2 vRoughnessUV;
flat in float vAngle;
layout(location = 0) out vec4 fragColor;
flat in float vOpacity;

void main()
{
    vec4 color = texture(diffuseMap, vDiffuseUV);
    vec4 normal_img = texture(normalMap, vNormalUV);
    vec4 roughness_img = texture(roughnessMap, vRoughnessUV);
    vec3 SSSColor = roughness_img.xyz;
    float roughness = roughness_img.w;
    vec3 normal = vec3(0.0);
    vec2 _52 = (normal_img.xy * 2.0) - vec2(1.0);
    normal.x = _52.x;
    normal.y = _52.y;
    normal.z = sqrt(clamp(1.0 - dot(normal.xy, normal.xy), 0.0, 1.0));
    normal = normalize(vec3(0.0, 0.0, 1.0) + ((normal - vec3(0.0, 0.0, 1.0)) * _78.normalStrength));
    vec3 rotated_normal = vec3((normal.x * cos(-vAngle)) + (normal.y * sin(-vAngle)), ((-normal.x) * sin(-vAngle)) + (normal.y * cos(-vAngle)), normal.z);
    vec3 illumination = vec3(0.0);
    vec3 lights_diffuse = vec3(0.0);
    vec3 lights_spec = vec3(0.0);
    for (int i = 0; i < 4; i++)
    {
        vec3 light_color = _78.lights[i].color.xyz;
        vec3 light_direction = normalize(_78.lights[i].direction.xyz);
        float lighting = max(0.0, dot(rotated_normal, -light_direction) + _78.lightWidth);
        vec3 light_diffuse = (light_color * lighting) * _78.brightness;
        vec3 reflect_dir = reflect(rotated_normal, -light_direction);
        vec3 view_dir = vec3(0.0, 0.0, -1.0);
        float spec = pow(max(0.0, dot(reflect_dir, view_dir) + _78.lightWidth) * (1.0 - roughness), _78.specPower);
        vec3 specularColor = color.xyz + ((vec3(1.0) - color.xyz) * _78.specPurity);
        vec3 specLight = ((specularColor * spec) * _78.specularStrength) * light_color;
        illumination += (light_color * max(-1.0, dot(rotated_normal, -light_direction) + _78.lightWidth));
        lights_diffuse += light_diffuse;
        lights_spec += specLight;
    }
    vec3 SSS = clamp((vec3(2.0) - illumination) - vec3(_78.SSSContrast), vec3(0.0), vec3(1.0)) * vec3(_78.SSSAmount);
    vec4 finalColor = vec4(((lights_spec + lights_diffuse) + _78.ambientLight.xyz) * color.xyz, color.w) * 1.0;
    fragColor = vec4(finalColor.xyz + clamp(SSSColor * SSS, vec3(0.0), vec3(1.0)), color.w) * clamp((color.w - 0.89999997615814208984375) * 10.0, 0.0, 1.0);
    fragColor *= vOpacity;
    if ((_78.flags & 16) != 0)
    {
        fragColor = vec4(lights_spec * color.w, 1.0);
    }
}

