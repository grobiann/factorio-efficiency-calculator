#version 330

layout(std140) uniform fsConstants
{
    vec2 invLeafTexSize;
    vec2 strength;
    vec2 distort;
    vec2 speed;
    float time;
    float inverseExpectedUVDerivative;
    uint debug;
} _139;

uniform sampler2D texDistortion;
uniform sampler2D texYCoCg;
uniform sampler2D texAlpha;

in vec2 vUVTexture;
in vec2 vUVDistortion;
in vec4 vTint;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;
flat in uint vExtra;

vec4 YCoCgToRGB(vec4 ycocg, float alpha)
{
    float Y = ycocg.w;
    float scale = 1.0 / ((31.875 * ycocg.z) + 1.0);
    float Co = (ycocg.x - 0.501960813999176025390625) * scale;
    float Cg = (ycocg.y - 0.501960813999176025390625) * scale;
    float R = (Y + Co) - Cg;
    float G = Y + Cg;
    float B = (Y - Co) - Cg;
    return vec4(R, G, B, alpha);
}

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _82;
    if ((extra & 48u) != 0u)
    {
        _82 = vec4(color.xyz, 0.0);
    }
    else
    {
        _82 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _82;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _107 = bvec4((extra & 16u) != 0u);
    return vec4(_107.x ? vec4(0.0).x : color.x, _107.y ? vec4(0.0).y : color.y, _107.z ? vec4(0.0).z : color.z, _107.w ? vec4(0.0).w : color.w);
}

void main()
{
    vec2 localUV = vUVTexture;
    vec2 distortion = vec2(0.0);
    vec4 offset = vec4(0.0);
    if (any(notEqual(vUVDistortion, vec2(-1.0))))
    {
        offset = texture(texDistortion, vUVDistortion);
        float localTime = _139.time + (((vTint.x + vTint.y) + vTint.z) * 5.0);
        distortion.x = offset.x * sin((offset.y * _139.distort.x) + (localTime * _139.speed.x));
        distortion.y = offset.x * cos((offset.y * _139.distort.y) + (localTime * _139.speed.y));
        vec2 localPixelXY = localUV * vec2(textureSize(texYCoCg, 0));
        distortion *= (dFdx(localPixelXY.x) * _139.inverseExpectedUVDerivative);
        vec2 copy = localPixelXY;
        localUV = (floor(localPixelXY) + (distortion * _139.strength)) * _139.invLeafTexSize;
        distortion = floor(localUV * vec2(textureSize(texYCoCg, 0))) - floor(copy);
        if (_139.debug != 0u)
        {
            fragColor = vec4(0.5 + (0.20000000298023223876953125 * distortion.x), 0.5 + (0.20000000298023223876953125 * distortion.y), dFdx(localPixelXY.x) * _139.inverseExpectedUVDerivative, 0.0);
        }
    }
    vec2 dUVdx = dFdx(localUV);
    vec2 dUVdy = dFdy(localUV);
    float alpha = textureGrad(texAlpha, localUV, dUVdx, dUVdy).x;
    if (alpha <= 0.0)
    {
        discard;
    }
    else
    {
        bool _284 = !(_139.debug != 0u);
        bool _291;
        if (!_284)
        {
            _291 = all(equal(vUVDistortion, vec2(-1.0)));
        }
        else
        {
            _291 = _284;
        }
        if (_291)
        {
            vec4 yCoCg = textureGrad(texYCoCg, localUV, dUVdx, dUVdy);
            vec4 param = yCoCg;
            float param_1 = alpha;
            fragColor = YCoCgToRGB(param, param_1);
            vec3 grayscale = ((fragColor.xxx + fragColor.yyy) + fragColor.zzz) / vec3(4.0);
            vec4 _319 = fragColor;
            vec3 _327 = mix(grayscale, _319.xyz, vec3(vTint.w)) * vTint.xyz;
            fragColor.x = _327.x;
            fragColor.y = _327.y;
            fragColor.z = _327.z;
        }
        else
        {
            vec4 _337 = fragColor;
            vec3 _339 = _337.xyz * alpha;
            fragColor.x = _339.x;
            fragColor.y = _339.y;
            fragColor.z = _339.z;
            fragColor.w = alpha;
        }
    }
    vec4 param_2 = fragColor;
    uint param_3 = vExtra;
    lightColor = getLightColor(param_2, param_3);
    vec4 param_4 = fragColor;
    uint param_5 = vExtra;
    fragColor = getFragColor(param_4, param_5);
}

