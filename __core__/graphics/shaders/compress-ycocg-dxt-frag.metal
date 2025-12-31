#pragma clang diagnostic ignored "-Wunused-variable"
#pragma clang diagnostic ignored "-Wunused-const-variable"
#pragma clang diagnostic ignored "-Wmissing-prototypes"
#pragma clang diagnostic ignored "-Wmissing-braces"

#include <metal_stdlib>
#include <simd/simd.h>

using namespace metal;

template<typename T, size_t Num>
struct spvUnsafeArray
{
    T elements[Num ? Num : 1];
    
    thread T& operator [] (size_t pos) thread
    {
        return elements[pos];
    }
    constexpr const thread T& operator [] (size_t pos) const thread
    {
        return elements[pos];
    }
    
    device T& operator [] (size_t pos) device
    {
        return elements[pos];
    }
    constexpr const device T& operator [] (size_t pos) const device
    {
        return elements[pos];
    }
    
    constexpr const constant T& operator [] (size_t pos) const constant
    {
        return elements[pos];
    }
    
    threadgroup T& operator [] (size_t pos) threadgroup
    {
        return elements[pos];
    }
    constexpr const threadgroup T& operator [] (size_t pos) const threadgroup
    {
        return elements[pos];
    }
};

struct mipMapGenParams
{
    int2 texOffset;
    int unusedLevel;
    uint unusedFromRGBA;
};

struct main0_out
{
    uint4 fragColor [[color(0)]];
};

static inline __attribute__((always_inline))
float3 toYCoCg(thread const float3& c)
{
    float Y = ((c.x + (2.0 * c.y)) + c.z) * 0.25;
    float Co = (((2.0 * c.x) - (2.0 * c.z)) * 0.25) + 0.501960813999176025390625;
    float Cg = ((((-c.x) + (2.0 * c.y)) - c.z) * 0.25) + 0.501960813999176025390625;
    return float3(Y, Co, Cg);
}

static inline __attribute__((always_inline))
bool fetchBlock(thread float4& gl_FragCoord, constant mipMapGenParams& _138, texture2d<float> tex, sampler texSmplr, thread spvUnsafeArray<float3, 16>& block)
{
    int2 baseCoord = (int2(4) * int2(gl_FragCoord.xy)) + _138.texOffset;
    bool isBlack = true;
    for (int by = 0; by < 4; by++)
    {
        for (int bx = 0; bx < 4; bx++)
        {
            int2 coord = baseCoord + int2(bx, by);
            float3 color = tex.read(uint2(coord), 0).xyz;
            isBlack = all(bool4(color == float3(0.0), isBlack));
            float3 param = color;
            block[(by * 4) + bx] = toYCoCg(param);
        }
    }
    return isBlack;
}

static inline __attribute__((always_inline))
void FindMinMaxColorsBox(thread float3& mincol, thread float3& maxcol, thread spvUnsafeArray<float3, 16>& block)
{
    mincol = float3(1.0);
    maxcol = float3(0.0);
    for (int i = 0; i < 16; i++)
    {
        mincol = fast::min(mincol, block[i]);
        maxcol = fast::max(maxcol, block[i]);
    }
}

static inline __attribute__((always_inline))
void SelectYCoCgDiagonal(thread float2& minColor, thread float2& maxColor, thread spvUnsafeArray<float3, 16>& block)
{
    float2 mid = (maxColor + minColor) * 0.5;
    float cov = 0.0;
    for (int i = 0; i < 16; i++)
    {
        float2 t = block[i].yz - mid;
        cov += (t.x * t.y);
    }
    if (cov < 0.0)
    {
        float tmp = maxColor.y;
        maxColor.y = minColor.y;
        minColor.y = tmp;
    }
}

static inline __attribute__((always_inline))
int GetYCoCgScale(thread const float2& minColor, thread const float2& maxColor)
{
    float2 m0 = abs(minColor - float2(0.501960813999176025390625));
    float2 m1 = abs(maxColor - float2(0.501960813999176025390625));
    float m = fast::max(fast::max(m0.x, m0.y), fast::max(m1.x, m1.y));
    int scale = 1;
    if (m < 0.2509804069995880126953125)
    {
        scale = 2;
    }
    if (m < 0.12549020349979400634765625)
    {
        scale = 4;
    }
    return scale;
}

static inline __attribute__((always_inline))
void InsetCoCgBBox(thread float2& mincol, thread float2& maxcol)
{
    float2 inset = ((maxcol - mincol) / float2(16.0)) - float2(0.00196078442968428134918212890625);
    mincol = fast::clamp(mincol + inset, float2(0.0), float2(1.0));
    maxcol = fast::clamp(maxcol - inset, float2(0.0), float2(1.0));
}

static inline __attribute__((always_inline))
uint EmitEndPointsYCoCgDXT5(thread float2& mincol, thread float2& maxcol, thread const int& scale)
{
    maxcol = ((maxcol - float2(0.501960813999176025390625)) * float(scale)) + float2(0.501960813999176025390625);
    mincol = ((mincol - float2(0.501960813999176025390625)) * float(scale)) + float2(0.501960813999176025390625);
    float2 param = mincol;
    float2 param_1 = maxcol;
    InsetCoCgBBox(param, param_1);
    mincol = param;
    maxcol = param_1;
    maxcol = round(maxcol * float2(31.0, 63.0));
    mincol = round(mincol * float2(31.0, 63.0));
    int2 imaxcol = int2(maxcol);
    int2 imincol = int2(mincol);
    uint2 result;
    result.x = uint(((imaxcol.x << 11) | (imaxcol.y << 5)) | (scale - 1));
    result.y = uint(((imincol.x << 11) | (imincol.y << 5)) | (scale - 1));
    imaxcol.x = (imaxcol.x << 3) | (imaxcol.x >> 2);
    imaxcol.y = (imaxcol.y << 2) | (imaxcol.y >> 4);
    imincol.x = (imincol.x << 3) | (imincol.x >> 2);
    imincol.y = (imincol.y << 2) | (imincol.y >> 4);
    maxcol = float2(imaxcol) * 0.0039215688593685626983642578125;
    mincol = float2(imincol) * 0.0039215688593685626983642578125;
    maxcol = ((maxcol - float2(0.501960813999176025390625)) / float2(float(scale))) + float2(0.501960813999176025390625);
    mincol = ((mincol - float2(0.501960813999176025390625)) / float2(float(scale))) + float2(0.501960813999176025390625);
    return result.x | (result.y << uint(16));
}

static inline __attribute__((always_inline))
float colorDistance(thread const float2& c0, thread const float2& c1)
{
    return dot(c0 - c1, c0 - c1);
}

static inline __attribute__((always_inline))
uint EmitIndicesYCoCgDXT5(thread const float2& mincol, thread const float2& maxcol, thread spvUnsafeArray<float3, 16>& block)
{
    spvUnsafeArray<float2, 4> c;
    c[0] = maxcol;
    c[1] = mincol;
    c[2] = mix(c[0], c[1], float2(0.3333333432674407958984375));
    c[3] = mix(c[0], c[1], float2(0.666666686534881591796875));
    uint indices = 0u;
    float4 dist;
    for (int i = 0; i < 16; i++)
    {
        float2 param = block[i].yz;
        float2 param_1 = c[0];
        dist.x = colorDistance(param, param_1);
        float2 param_2 = block[i].yz;
        float2 param_3 = c[1];
        dist.y = colorDistance(param_2, param_3);
        float2 param_4 = block[i].yz;
        float2 param_5 = c[2];
        dist.z = colorDistance(param_4, param_5);
        float2 param_6 = block[i].yz;
        float2 param_7 = c[3];
        dist.w = colorDistance(param_6, param_7);
        uint4 b = uint4(dist.xyxy > dist.wzzw);
        uint b4 = uint(dist.z > dist.w);
        uint index = (b.x & b4) | (((b.y & b.z) | (b.x & b.w)) << uint(1));
        indices |= (index << uint(i * 2));
    }
    return indices;
}

static inline __attribute__((always_inline))
void InsetYBBox(thread float& mincol, thread float& maxcol)
{
    float inset = ((maxcol - mincol) / 32.0) - 0.00196078442968428134918212890625;
    mincol = fast::clamp(mincol + inset, 0.0, 1.0);
    maxcol = fast::clamp(maxcol - inset, 0.0, 1.0);
}

static inline __attribute__((always_inline))
uint EmitAlphaEndPointsYCoCgDXT5(thread float& mincol, thread float& maxcol)
{
    float param = mincol;
    float param_1 = maxcol;
    InsetYBBox(param, param_1);
    mincol = param;
    maxcol = param_1;
    uint c0 = uint(round(mincol * 255.0));
    uint c1 = uint(round(maxcol * 255.0));
    return (c0 << uint(8)) | c1;
}

static inline __attribute__((always_inline))
uint2 EmitAlphaIndicesYCoCgDXT5(thread const float& minAlpha, thread const float& maxAlpha, thread spvUnsafeArray<float3, 16>& block)
{
    float mid = (maxAlpha - minAlpha) / 14.0;
    float ab1 = minAlpha + mid;
    float ab2 = (((6.0 * maxAlpha) + (1.0 * minAlpha)) * 0.14285714924335479736328125) + mid;
    float ab3 = (((5.0 * maxAlpha) + (2.0 * minAlpha)) * 0.14285714924335479736328125) + mid;
    float ab4 = (((4.0 * maxAlpha) + (3.0 * minAlpha)) * 0.14285714924335479736328125) + mid;
    float ab5 = (((3.0 * maxAlpha) + (4.0 * minAlpha)) * 0.14285714924335479736328125) + mid;
    float ab6 = (((2.0 * maxAlpha) + (5.0 * minAlpha)) * 0.14285714924335479736328125) + mid;
    float ab7 = (((1.0 * maxAlpha) + (6.0 * minAlpha)) * 0.14285714924335479736328125) + mid;
    uint2 indices = uint2(0u);
    uint index = 0u;
    for (int i = 0; i < 6; i++)
    {
        float a = block[i].x;
        index = 1u;
        index += uint(a <= ab1);
        index += uint(a <= ab2);
        index += uint(a <= ab3);
        index += uint(a <= ab4);
        index += uint(a <= ab5);
        index += uint(a <= ab6);
        index += uint(a <= ab7);
        index &= 7u;
        index ^= uint(2u > index);
        indices.x |= (index << uint((3 * i) + 16));
    }
    indices.y = index >> uint(1);
    for (int i_1 = 6; i_1 < 16; i_1++)
    {
        float a_1 = block[i_1].x;
        index = 1u;
        index += uint(a_1 <= ab1);
        index += uint(a_1 <= ab2);
        index += uint(a_1 <= ab3);
        index += uint(a_1 <= ab4);
        index += uint(a_1 <= ab5);
        index += uint(a_1 <= ab6);
        index += uint(a_1 <= ab7);
        index &= 7u;
        index ^= uint(2u > index);
        indices.y |= (index << uint((3 * i_1) - 16));
    }
    return indices;
}

static inline __attribute__((always_inline))
uint4 compress_YCoCg_DXT_fp(thread spvUnsafeArray<float3, 16>& block)
{
    float3 param;
    float3 param_1;
    FindMinMaxColorsBox(param, param_1, block);
    float3 mincol = param;
    float3 maxcol = param_1;
    float2 param_2 = mincol.yz;
    float2 param_3 = maxcol.yz;
    SelectYCoCgDiagonal(param_2, param_3, block);
    mincol.y = param_2.x;
    mincol.z = param_2.y;
    maxcol.y = param_3.x;
    maxcol.z = param_3.y;
    float2 param_4 = mincol.yz;
    float2 param_5 = maxcol.yz;
    int scale = GetYCoCgScale(param_4, param_5);
    float2 param_6 = mincol.yz;
    float2 param_7 = maxcol.yz;
    int param_8 = scale;
    uint _907 = EmitEndPointsYCoCgDXT5(param_6, param_7, param_8);
    mincol.y = param_6.x;
    mincol.z = param_6.y;
    maxcol.y = param_7.x;
    maxcol.z = param_7.y;
    uint4 result;
    result.z = _907;
    float2 param_9 = mincol.yz;
    float2 param_10 = maxcol.yz;
    result.w = EmitIndicesYCoCgDXT5(param_9, param_10, block);
    float param_11 = mincol.x;
    float param_12 = maxcol.x;
    uint _933 = EmitAlphaEndPointsYCoCgDXT5(param_11, param_12);
    mincol.x = param_11;
    maxcol.x = param_12;
    result.x = _933;
    float param_13 = mincol.x;
    float param_14 = maxcol.x;
    uint2 indices = EmitAlphaIndicesYCoCgDXT5(param_13, param_14, block);
    result.x |= indices.x;
    result.y = indices.y;
    return result;
}

fragment main0_out main0(constant mipMapGenParams& _138 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    spvUnsafeArray<float3, 16> block;
    bool _960 = fetchBlock(gl_FragCoord, _138, tex, texSmplr, block);
    bool isBlack = _960;
    out.fragColor = compress_YCoCg_DXT_fp(block);
    if (isBlack)
    {
        out.fragColor = uint4(2454257664u, 613566756u, 2078508035u, 2863311530u);
    }
    return out;
}

