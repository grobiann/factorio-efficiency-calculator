#version 330

uniform sampler2D tex;

flat in float time;
flat in float randomSeed;
flat in float fusionPower;
flat in float quality;
flat in float plasmaLevel;
in vec4 color;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;

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

vec2 getNoise(vec2 coords)
{
    vec2 param = vec2(randomSeed + 0.2106563150882720947265625, randomSeed + 0.87850248813629150390625);
    vec2 param_1 = (coords + vec2(time)) + vec2(random(param) * 100.0);
    float noise_x = perlinNoise(param_1);
    vec2 param_2 = vec2(randomSeed + 0.3071096837520599365234375, randomSeed + 0.0619773231446743011474609375);
    vec2 param_3 = (coords + vec2(time)) + vec2(random(param_2) * 100.0);
    float noise_y = perlinNoise(param_3);
    return (vec2(noise_x, noise_y) - vec2(0.5)) * 2.0;
}

void main()
{
    float plasma_power = fusionPower + (quality * 0.039999999105930328369140625);
    float bg_power = pow(plasmaLevel, 1.0) + (quality * 0.039999999105930328369140625);
    bg_power = max(bg_power, plasma_power * 0.25);
    vec4 background = color * pow(bg_power, 1.5);
    vec2 texSize = vec2(textureSize(tex, 0));
    vec2 pixelatedUV = floor(vUV * texSize) / texSize;
    vec2 param = pixelatedUV;
    float whiteNoise = random(param);
    vec3 uv_effect_texture = texture(tex, pixelatedUV).xyz;
    float mask = uv_effect_texture.z;
    mask = max(mask - (whiteNoise * 0.125), 0.0);
    vec2 effectUV = uv_effect_texture.xy;
    effectUV.x *= 12.0;
    effectUV.x += (((time * 1.0) * (quality + 1.0)) * 2.0);
    vec2 param_1 = effectUV;
    effectUV += (getNoise(param_1) * 0.20000000298023223876953125);
    float gradient = 1.0 - abs(effectUV.y - 0.5);
    background = mix(background * gradient, background, vec4(plasma_power));
    background *= mask;
    float mid_gradient = (pow(gradient, 30.0 * min(bg_power, 1.0)) * plasma_power) * 2.0;
    float plasma_line = (mid_gradient + ((pow(gradient, 30.0) * plasma_power) * 2.0)) * pow(mask, 0.5);
    plasma_line = mix(plasma_line, 0.0, mask * 0.5);
    vec4 colored_plasma_line = mix(vec4(plasma_line) * color, vec4(plasma_line), vec4(bg_power * mask));
    fragColor = background + colored_plasma_line;
    lightColor = fragColor;
}

