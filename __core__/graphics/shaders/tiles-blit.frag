#version 330

layout(std140) uniform EffectUniforms
{
    vec2 resolution;
    vec2 backgroundOffset;
    vec2 padding_0;
    float time;
    float zoom;
    float scaleFactor;
} _22;

uniform sampler2D tex;

layout(location = 0) out vec4 fragColor;

void main()
{
    fragColor = texture(tex, (gl_FragCoord.xy / _22.resolution) * _22.scaleFactor);
}

