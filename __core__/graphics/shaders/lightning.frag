#version 330

layout(std140) uniform LightningProperties
{
    mat4 mvp;
    vec4 initialColor;
    float distortion;
    float initialThickness;
    float power;
    float time;
} _215;

in vec2 vPosition;
layout(location = 0) out vec4 fragColor;
in float vIntensity;
in vec2 vUV;

float valueOverTime(float start, float end, float power)
{
    return pow((_215.time - start) / (end - start), power);
}

float valueOverTime(float start, float end)
{
    return (_215.time - start) / (end - start);
}

float random(vec2 st)
{
    float s = dot(st, vec2(12.345600128173828125, 34.141498565673828125));
    return fract(sin(s) * 45678.8984375);
}

float perlinNoise(vec2 st)
{
    vec2 cell = floor(st);
    vec2 cell2 = ceil(st);
    vec2 f = fract(st);
    vec2 param = cell;
    float s00 = random(param);
    vec2 param_1 = vec2(cell.x, cell2.y);
    float s01 = random(param_1);
    vec2 param_2 = vec2(cell2.x, cell.y);
    float s10 = random(param_2);
    vec2 param_3 = cell2;
    float s11 = random(param_3);
    return mix(mix(s00, s10, f.x), mix(s01, s11, f.x), f.y);
}

vec3 noise3D()
{
    vec3 _noise = vec3(0.0);
    for (int i = 1; i <= 4; i++)
    {
        float iscale = pow(2.0, float(i - 1));
        vec2 param = (vPosition * iscale) * 30.0;
        vec2 param_1 = vPosition + vec2(76.4499969482421875);
        vec2 param_2 = param_1;
        param.x += (perlinNoise(param_2) * 0.20000000298023223876953125);
        vec2 param_2_1 = vPosition + vec2(91.0);
        vec2 param_3 = param_2_1;
        param.y += (perlinNoise(param_3) * 0.20000000298023223876953125);
        float influence = 1.0 / pow(float(i), 2.0);
        vec2 param_3_1 = param + vec2(23.6499996185302734375);
        vec2 param_4 = param_3_1;
        _noise.x += (perlinNoise(param_4) * influence);
        vec2 param_4_1 = param + vec2(12.340000152587890625);
        vec2 param_5 = param_4_1;
        _noise.y += (perlinNoise(param_5) * influence);
        vec2 param_5_1 = param + vec2(82.339996337890625);
        vec2 param_6 = param_5_1;
        _noise.z += (perlinNoise(param_6) * influence);
    }
    vec3 _207 = _noise;
    vec3 _208 = _207 - vec3(0.5);
    _noise = _208;
    return _208;
}

void main()
{
    float param = 0.0;
    float param_1 = 0.300000011920928955078125;
    float param_2 = 0.75;
    if ((length(vPosition) - 0.100000001490116119384765625) > valueOverTime(param, param_1, param_2))
    {
        fragColor = vec4(0.0);
        return;
    }
    bool _262 = vIntensity != 1.0;
    bool _268;
    if (_262)
    {
        _268 = vPosition.y < 0.20000000298023223876953125;
    }
    else
    {
        _268 = _262;
    }
    bool isCloud = _268;
    float growth;
    if (isCloud)
    {
        float param_3 = 0.0;
        float param_4 = 0.20000000298023223876953125;
        growth = ((1.0 - length(vPosition)) - valueOverTime(param_3, param_4)) - 0.20000000298023223876953125;
    }
    else
    {
        float param_5 = 0.0;
        float param_6 = 0.300000011920928955078125;
        float param_7 = 0.75;
        growth = length(vPosition) - valueOverTime(param_5, param_6, param_7);
    }
    growth = min(max(0.0500000007450580596923828125 - growth, 0.0) * 50.0, 1.0);
    float thickness = _215.initialThickness * growth;
    float opacity = _215.initialColor.w;
    vec3 color = _215.initialColor.xyz;
    float param_8 = 0.20000000298023223876953125;
    float param_9 = 0.300000011920928955078125;
    float bolt = length(vPosition) - valueOverTime(param_8, param_9);
    if (isCloud)
    {
        float param_10 = 0.0;
        float param_11 = 0.300000011920928955078125;
        bolt = ((1.0 - length(vPosition)) - valueOverTime(param_10, param_11)) - 0.300000011920928955078125;
    }
    bolt *= ((bolt > 0.0) ? 4.0 : (-0.100000001490116119384765625));
    bolt = max(pow((0.1500000059604644775390625 - bolt) * 7.0, 3.0), 0.0);
    bolt = mix(0.0, bolt, pow(vIntensity, 1.5));
    bolt -= (max(vPosition.y - 0.949999988079071044921875, 0.0) * 20.0);
    if (bolt > 0.0)
    {
        thickness = mix(thickness, pow(thickness, 0.20000000298023223876953125) * 5.0, bolt * 0.5);
        color = mix(color, vec3(0.800000011920928955078125, 0.0, 0.0) + color, vec3(pow(bolt, 0.5)));
    }
    vec3 _noise = noise3D();
    float gradient = clamp(2.0 * abs(vUV.x - 0.5), 0.0, 1.0);
    vec2 distortedUV = vUV + (((_noise.xy * _215.distortion) * vIntensity) * max(1.0 - (bolt * 0.5), 0.0));
    float distorted_bolt = clamp(2.0 * abs(distortedUV.x - 0.5), 0.0, 1.0);
    float distorted_opacity = mix(opacity, opacity - _noise.x, _215.time);
    distorted_opacity *= (1.0 - pow(gradient, 4.0));
    color = normalize(color);
    color += ((vec3(1.0) * (1.0 - pow(gradient, 0.699999988079071044921875))) * distorted_opacity);
    color += ((_noise * 0.300000011920928955078125) * (1.0 - pow(gradient, 4.0)));
    fragColor = vec4(max(thickness - distorted_bolt, 0.0));
    float min_value = max(mix(mix(0.0500000007450580596923828125, 0.0005000000237487256526947021484375, opacity), 0.0, bolt), 0.0);
    float factor = ((((-distorted_bolt) + 0.300000011920928955078125) + (bolt * 0.5)) + opacity) - 1.0;
    factor = pow(max(factor, 0.0), 2.0);
    fragColor *= mix(min_value, 1.0, factor);
    vec4 _477 = fragColor;
    vec3 _479 = _477.xyz * color;
    fragColor.x = _479.x;
    fragColor.y = _479.y;
    fragColor.z = _479.z;
    fragColor = min(pow(fragColor, vec4(_215.power)), vec4(1.0));
    fragColor *= distorted_opacity;
    vec4 _502 = fragColor;
    vec3 _504 = _502.xyz * mix(vec3(0.0), color, vec3(1.0 - distorted_bolt));
    fragColor.x = _504.x;
    fragColor.y = _504.y;
    fragColor.z = _504.z;
    fragColor *= (1.0 + min(bolt, 0.5));
    fragColor *= ((vPosition.y + 0.75) / 1.75);
}

