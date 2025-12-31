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
    int2 offset;
    int unusedLevel;
    uint useChannelVec;
    float4 channelVec;
};

struct main0_out
{
    uint2 fragColor [[color(0)]];
};

static inline __attribute__((always_inline))
void fetchBlock(thread float4& gl_FragCoord, constant mipMapGenParams& _43, texture2d<float> tex, sampler texSmplr, thread spvUnsafeArray<float, 16>& blockAlpha)
{
    int2 baseCoord = (int2(4) * int2(gl_FragCoord.xy)) + _43.offset;
    for (int by = 0; by < 4; by++)
    {
        for (int bx = 0; bx < 4; bx++)
        {
            float4 color = float4(0.0);
            int2 coord = baseCoord + int2(bx, by);
            float4 t1 = tex.read(uint2(coord), 0);
            float alpha = t1.x;
            if (_43.useChannelVec != 0u)
            {
                alpha = dot(t1, _43.channelVec);
            }
            blockAlpha[(by * 4) + bx] = alpha;
        }
    }
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
uint2 EmitAlphaIndicesYCoCgDXT5(thread const float& minAlpha, thread const float& maxAlpha, thread spvUnsafeArray<float, 16>& blockAlpha)
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
        float a = blockAlpha[i];
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
        float a_1 = blockAlpha[i_1];
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

fragment main0_out main0(constant mipMapGenParams& _43 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    spvUnsafeArray<float, 16> blockAlpha;
    fetchBlock(gl_FragCoord, _43, tex, texSmplr, blockAlpha);
    float minAlpha = blockAlpha[0];
    float maxAlpha = blockAlpha[0];
    for (int i = 1; i < 16; i++)
    {
        minAlpha = fast::min(minAlpha, blockAlpha[i]);
        maxAlpha = fast::max(maxAlpha, blockAlpha[i]);
    }
    float param = minAlpha;
    float param_1 = maxAlpha;
    uint _423 = EmitAlphaEndPointsYCoCgDXT5(param, param_1);
    minAlpha = param;
    maxAlpha = param_1;
    uint2 result;
    result.x = _423;
    float param_2 = minAlpha;
    float param_3 = maxAlpha;
    uint2 indices = EmitAlphaIndicesYCoCgDXT5(param_2, param_3, blockAlpha);
    result.x |= indices.x;
    result.y = indices.y;
    out.fragColor = result;
    return out;
}

