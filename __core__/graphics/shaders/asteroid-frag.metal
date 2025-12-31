#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

struct Light
{
    float4 color;
    float4 direction;
};

struct AsteroidConstants
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
    float4 ambientLight;
    int flags;
};

struct main0_out
{
    float4 fragColor [[color(0)]];
};

struct main0_in
{
    float2 vDiffuseUV [[user(locn0)]];
    float2 vNormalUV [[user(locn1)]];
    float2 vRoughnessUV [[user(locn2)]];
    float vAngle [[user(locn3), flat]];
    float vOpacity [[user(locn4), flat]];
};

fragment main0_out main0(main0_in in [[stage_in]], constant AsteroidConstants& _78 [[buffer(0)]], texture2d<float> diffuseMap [[texture(0)]], texture2d<float> normalMap [[texture(1)]], texture2d<float> roughnessMap [[texture(2)]], sampler diffuseMapSmplr [[sampler(0)]], sampler normalMapSmplr [[sampler(1)]], sampler roughnessMapSmplr [[sampler(2)]])
{
    main0_out out = {};
    float4 color = diffuseMap.sample(diffuseMapSmplr, in.vDiffuseUV);
    float4 normal_img = normalMap.sample(normalMapSmplr, in.vNormalUV);
    float4 roughness_img = roughnessMap.sample(roughnessMapSmplr, in.vRoughnessUV);
    float3 SSSColor = roughness_img.xyz;
    float roughness = roughness_img.w;
    float3 normal = float3(0.0);
    float2 _52 = (normal_img.xy * 2.0) - float2(1.0);
    normal.x = _52.x;
    normal.y = _52.y;
    normal.z = sqrt(fast::clamp(1.0 - dot(normal.xy, normal.xy), 0.0, 1.0));
    normal = fast::normalize(float3(0.0, 0.0, 1.0) + ((normal - float3(0.0, 0.0, 1.0)) * _78.normalStrength));
    float3 rotated_normal = float3((normal.x * cos(-in.vAngle)) + (normal.y * sin(-in.vAngle)), ((-normal.x) * sin(-in.vAngle)) + (normal.y * cos(-in.vAngle)), normal.z);
    float3 illumination = float3(0.0);
    float3 lights_diffuse = float3(0.0);
    float3 lights_spec = float3(0.0);
    for (int i = 0; i < 4; i++)
    {
        float3 light_color = _78.lights[i].color.xyz;
        float3 light_direction = fast::normalize(_78.lights[i].direction.xyz);
        float lighting = fast::max(0.0, dot(rotated_normal, -light_direction) + _78.lightWidth);
        float3 light_diffuse = (light_color * lighting) * _78.brightness;
        float3 reflect_dir = reflect(rotated_normal, -light_direction);
        float3 view_dir = float3(0.0, 0.0, -1.0);
        float spec = powr(fast::max(0.0, dot(reflect_dir, view_dir) + _78.lightWidth) * (1.0 - roughness), _78.specPower);
        float3 specularColor = color.xyz + ((float3(1.0) - color.xyz) * _78.specPurity);
        float3 specLight = ((specularColor * spec) * _78.specularStrength) * light_color;
        illumination += (light_color * fast::max(-1.0, dot(rotated_normal, -light_direction) + _78.lightWidth));
        lights_diffuse += light_diffuse;
        lights_spec += specLight;
    }
    float3 SSS = fast::clamp((float3(2.0) - illumination) - float3(_78.SSSContrast), float3(0.0), float3(1.0)) * float3(_78.SSSAmount);
    float4 finalColor = float4(((lights_spec + lights_diffuse) + _78.ambientLight.xyz) * color.xyz, color.w) * 1.0;
    out.fragColor = float4(finalColor.xyz + fast::clamp(SSSColor * SSS, float3(0.0), float3(1.0)), color.w) * fast::clamp((color.w - 0.89999997615814208984375) * 10.0, 0.0, 1.0);
    out.fragColor *= in.vOpacity;
    if ((_78.flags & 16) != 0)
    {
        out.fragColor = float4(lights_spec * color.w, 1.0);
    }
    return out;
}

