#version 330

uniform usampler2D tex1;

in vec2 vUV;
layout(location = 0) out vec4 fragColor;
in vec4 vTintWith565Multiplier;

vec3 unpackRGB565(int rgb5)
{
    return vec3(ivec3(rgb5) & ivec3(63488, 2016, 31));
}

void main()
{
    ivec2 size = textureSize(tex1, 0);
    vec2 coord = floor(vUV * vec2(size));
    int rgb5 = int(texelFetch(tex1, ivec2(coord), 0).x);
    int param = rgb5;
    vec3 _67 = unpackRGB565(param) * vTintWith565Multiplier.xyz;
    fragColor.x = _67.x;
    fragColor.y = _67.y;
    fragColor.z = _67.z;
    fragColor.w = vTintWith565Multiplier.w;
}

