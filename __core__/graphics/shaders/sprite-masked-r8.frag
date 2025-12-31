#version 330

uniform sampler2D tex;
uniform sampler2D mask;

layout(location = 0) out vec4 fragColor;
in vec2 vUV;
in vec4 vTint;
flat in uint vExtra;

void main()
{
    fragColor = (vTint * texture(tex, vUV).x) * texelFetch(mask, ivec2(gl_FragCoord.xy), 0);
}

