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
} _85;

uniform sampler2D texDistortion;
uniform sampler2D tex;

in vec2 vUVTexture;
in vec2 vUVDistortion;
in vec4 vTint;
layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 lightColor;
flat in uint vExtra;

vec4 getLightColor(vec4 color, uint extra)
{
    vec4 _26;
    if ((extra & 48u) != 0u)
    {
        _26 = vec4(color.xyz, 0.0);
    }
    else
    {
        _26 = vec4(0.0, 0.0, 0.0, color.w);
    }
    return _26;
}

vec4 getFragColor(vec4 color, uint extra)
{
    bvec4 _53 = bvec4((extra & 16u) != 0u);
    return vec4(_53.x ? vec4(0.0).x : color.x, _53.y ? vec4(0.0).y : color.y, _53.z ? vec4(0.0).z : color.z, _53.w ? vec4(0.0).w : color.w);
}

void main()
{
    vec2 localUV = vUVTexture;
    vec2 distortion = vec2(0.0);
    vec4 offset = vec4(0.0);
    if (any(notEqual(vUVDistortion, vec2(-1.0))))
    {
        offset = texture(texDistortion, vUVDistortion);
        float localTime = _85.time + (((vTint.x + vTint.y) + vTint.z) * 5.0);
        distortion.x = offset.x * sin((offset.y * _85.distort.x) + (localTime * _85.speed.x));
        distortion.y = offset.x * cos((offset.y * _85.distort.y) + (localTime * _85.speed.y));
        vec2 localPixelXY = localUV * vec2(textureSize(tex, 0));
        distortion *= (dFdx(localPixelXY.x) * _85.inverseExpectedUVDerivative);
        vec2 copy = localPixelXY;
        localUV = (floor(localPixelXY) + (distortion * _85.strength)) * _85.invLeafTexSize;
        distortion = floor(localUV * vec2(textureSize(tex, 0))) - floor(copy);
        if (_85.debug != 0u)
        {
            fragColor = vec4(0.5 + (0.20000000298023223876953125 * distortion.x), 0.5 + (0.20000000298023223876953125 * distortion.y), dFdx(localPixelXY.x) * _85.inverseExpectedUVDerivative, 0.0);
        }
    }
    vec4 sampledPixel = texture(tex, localUV);
    if (sampledPixel.w <= 0.0)
    {
        discard;
    }
    else
    {
        bool _223 = !(_85.debug != 0u);
        bool _230;
        if (!_223)
        {
            _230 = all(equal(vUVDistortion, vec2(-1.0)));
        }
        else
        {
            _230 = _223;
        }
        if (_230)
        {
            fragColor = sampledPixel;
            float grayscale = ((fragColor.x + fragColor.y) + fragColor.z) / 4.0;
            vec4 _248 = fragColor;
            vec3 _256 = mix(vec3(grayscale), _248.xyz, vec3(vTint.w)) * vTint.xyz;
            fragColor.x = _256.x;
            fragColor.y = _256.y;
            fragColor.z = _256.z;
        }
        else
        {
            vec4 _266 = fragColor;
            vec3 _268 = _266.xyz * sampledPixel.w;
            fragColor.x = _268.x;
            fragColor.y = _268.y;
            fragColor.z = _268.z;
            fragColor.w = sampledPixel.w;
        }
    }
    vec4 param = fragColor;
    uint param_1 = vExtra;
    lightColor = getLightColor(param, param_1);
    vec4 param_2 = fragColor;
    uint param_3 = vExtra;
    fragColor = getFragColor(param_2, param_3);
}

