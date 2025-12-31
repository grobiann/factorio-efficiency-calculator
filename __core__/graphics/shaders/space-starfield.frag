#version 330

struct ParallaxLayerDef
{
    uint beginQuadID;
    uint endQuadID;
    vec2 seed;
    vec2 gridTopLeftCellID;
    vec2 gridOffset;
    vec2 gridSize;
    vec2 starSize;
    vec2 cellBaseVector0;
    vec2 cellBaseVector1;
};

layout(std140) uniform StarfieldConstants
{
    mat4 projection;
    vec2 resolution;
    vec2 backgroundOffset;
    float time;
    float timeRaw;
    float zoom;
    float starsPerCell;
    float starBrightness;
    float starShape;
    float starSaturation;
    int parallaxLayerCount;
    ParallaxLayerDef layers[4];
} ub;

flat in vec3 vColor;
in vec2 vUV;
layout(location = 0) out vec4 fragColor;

float minkowski_distance(vec2 p1, vec2 p2)
{
    float power = ub.starShape;
    float minkowski = pow(pow(abs(p1.x - p2.x), power) + pow(abs(p1.y - p2.y), power), 1.0 / power);
    return minkowski;
}

void main()
{
    vec3 starColor = vColor;
    float BWStars = ((starColor.x + starColor.y) + starColor.z) / 3.0;
    starColor = (starColor * ub.starSaturation) + vec3(BWStars * (1.0 - ub.starSaturation));
    vec2 param = vUV;
    vec2 param_1 = vec2(0.0);
    float star_mask = minkowski_distance(param, param_1);
    float brightness = pow(max(BWStars - star_mask, 0.0), 5.0);
    fragColor = vec4(((starColor * brightness) * ub.starBrightness) * 5.0, 0.0);
}

