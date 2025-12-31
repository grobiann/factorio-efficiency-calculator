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
    uint noAlphaBlock;
};

constant spvUnsafeArray<uint4, 256> _387 = spvUnsafeArray<uint4, 256>({ uint4(0u), uint4(0u, 0u, 0u, 1u), uint4(0u, 1u, 1u, 0u), uint4(0u, 1u, 1u, 0u), uint4(1u, 0u, 1u, 1u), uint4(1u, 0u, 2u, 0u), uint4(1u, 0u, 2u, 1u), uint4(1u, 1u, 3u, 0u), uint4(1u, 1u, 3u, 0u), uint4(2u, 0u, 3u, 1u), uint4(2u, 0u, 4u, 0u), uint4(0u, 4u, 4u, 0u), uint4(2u, 1u, 4u, 1u), uint4(2u, 1u, 5u, 0u), uint4(2u, 1u, 5u, 1u), uint4(3u, 0u, 6u, 0u), uint4(3u, 0u, 6u, 0u), uint4(3u, 0u, 6u, 1u), uint4(3u, 1u, 7u, 0u), uint4(1u, 5u, 7u, 0u), uint4(3u, 2u, 7u, 1u), uint4(3u, 2u, 8u, 0u), uint4(4u, 0u, 8u, 1u), uint4(4u, 0u, 8u, 1u), uint4(4u, 1u, 8u, 2u), uint4(4u, 1u, 9u, 1u), uint4(4u, 2u, 9u, 2u), uint4(4u, 2u, 9u, 2u), uint4(4u, 2u, 9u, 3u), uint4(3u, 5u, 10u, 2u), uint4(5u, 1u, 10u, 3u), uint4(5u, 1u, 10u, 3u), uint4(5u, 2u, 10u, 4u), uint4(4u, 4u, 11u, 3u), uint4(5u, 3u, 11u, 4u), uint4(5u, 3u, 11u, 4u), uint4(5u, 3u, 11u, 5u), uint4(6u, 2u, 12u, 4u), uint4(6u, 2u, 12u, 5u), uint4(6u, 2u, 12u, 5u), uint4(6u, 3u, 12u, 6u), uint4(5u, 5u, 13u, 5u), uint4(6u, 4u, 13u, 6u), uint4(6u, 4u, 8u, 16u), uint4(4u, 8u, 13u, 7u), uint4(7u, 3u, 14u, 6u), uint4(7u, 3u, 14u, 7u), uint4(7u, 3u, 9u, 17u), uint4(7u, 4u, 14u, 8u), uint4(7u, 4u, 15u, 7u), uint4(7u, 4u, 15u, 8u), uint4(7u, 5u, 11u, 16u), uint4(5u, 9u, 15u, 9u), uint4(7u, 6u, 15u, 10u), uint4(7u, 6u, 16u, 8u), uint4(8u, 4u, 16u, 9u), uint4(8u, 4u, 16u, 10u), uint4(8u, 5u, 15u, 13u), uint4(8u, 5u, 17u, 9u), uint4(8u, 6u, 17u, 10u), uint4(8u, 6u, 17u, 11u), uint4(8u, 6u, 15u, 16u), uint4(7u, 9u, 18u, 10u), uint4(9u, 5u, 18u, 11u), uint4(9u, 5u, 18u, 12u), uint4(9u, 6u, 16u, 16u), uint4(8u, 8u, 19u, 11u), uint4(9u, 7u, 19u, 12u), uint4(9u, 7u, 19u, 13u), uint4(9u, 7u, 17u, 17u), uint4(10u, 6u, 20u, 12u), uint4(10u, 6u, 20u, 13u), uint4(10u, 6u, 20u, 14u), uint4(10u, 7u, 19u, 16u), uint4(9u, 9u, 21u, 13u), uint4(10u, 8u, 21u, 14u), uint4(10u, 8u, 21u, 15u), uint4(8u, 12u, 20u, 17u), uint4(11u, 7u, 22u, 14u), uint4(11u, 7u, 22u, 15u), uint4(11u, 7u, 25u, 10u), uint4(11u, 8u, 22u, 16u), uint4(11u, 8u, 23u, 15u), uint4(11u, 8u, 23u, 16u), uint4(11u, 9u, 26u, 11u), uint4(9u, 13u, 23u, 17u), uint4(11u, 10u, 24u, 16u), uint4(11u, 10u, 24u, 17u), uint4(12u, 8u, 27u, 12u), uint4(12u, 8u, 24u, 18u), uint4(12u, 9u, 25u, 17u), uint4(12u, 9u, 25u, 18u), uint4(12u, 10u, 28u, 13u), uint4(12u, 10u, 25u, 19u), uint4(12u, 10u, 26u, 18u), uint4(11u, 13u, 26u, 19u), uint4(13u, 9u, 29u, 14u), uint4(13u, 9u, 26u, 20u), uint4(13u, 10u, 27u, 19u), uint4(12u, 12u, 27u, 20u), uint4(13u, 11u, 30u, 15u), uint4(13u, 11u, 27u, 21u), uint4(13u, 11u, 28u, 20u), uint4(14u, 10u, 28u, 21u), uint4(14u, 10u, 28u, 21u), uint4(14u, 10u, 28u, 22u), uint4(14u, 11u, 29u, 21u), uint4(13u, 13u, 29u, 22u), uint4(14u, 12u, 24u, 32u), uint4(14u, 12u, 29u, 23u), uint4(12u, 16u, 30u, 22u), uint4(15u, 11u, 30u, 23u), uint4(15u, 11u, 25u, 33u), uint4(15u, 11u, 30u, 24u), uint4(15u, 12u, 31u, 23u), uint4(15u, 12u, 31u, 24u), uint4(15u, 12u, 27u, 32u), uint4(15u, 13u, 31u, 25u), uint4(13u, 17u, 31u, 26u), uint4(15u, 14u, 32u, 24u), uint4(15u, 14u, 32u, 25u), uint4(16u, 12u, 32u, 26u), uint4(16u, 12u, 31u, 29u), uint4(16u, 13u, 33u, 25u), uint4(16u, 13u, 33u, 26u), uint4(16u, 14u, 33u, 27u), uint4(16u, 14u, 31u, 32u), uint4(16u, 14u, 34u, 26u), uint4(15u, 17u, 34u, 27u), uint4(17u, 13u, 34u, 28u), uint4(17u, 13u, 32u, 32u), uint4(17u, 14u, 35u, 27u), uint4(16u, 16u, 35u, 28u), uint4(17u, 15u, 35u, 29u), uint4(17u, 15u, 33u, 33u), uint4(17u, 15u, 36u, 28u), uint4(18u, 14u, 36u, 29u), uint4(18u, 14u, 36u, 30u), uint4(18u, 14u, 35u, 32u), uint4(18u, 15u, 37u, 29u), uint4(17u, 17u, 37u, 30u), uint4(18u, 16u, 37u, 31u), uint4(18u, 16u, 36u, 33u), uint4(16u, 20u, 38u, 30u), uint4(19u, 15u, 38u, 31u), uint4(19u, 15u, 41u, 26u), uint4(19u, 15u, 38u, 32u), uint4(19u, 16u, 39u, 31u), uint4(19u, 16u, 39u, 32u), uint4(19u, 16u, 42u, 27u), uint4(19u, 17u, 39u, 33u), uint4(17u, 21u, 40u, 32u), uint4(19u, 18u, 40u, 33u), uint4(19u, 18u, 43u, 28u), uint4(20u, 16u, 40u, 34u), uint4(20u, 16u, 41u, 33u), uint4(20u, 17u, 41u, 34u), uint4(20u, 17u, 44u, 29u), uint4(20u, 18u, 41u, 35u), uint4(20u, 18u, 42u, 34u), uint4(20u, 18u, 42u, 35u), uint4(19u, 21u, 45u, 30u), uint4(21u, 17u, 42u, 36u), uint4(21u, 17u, 43u, 35u), uint4(21u, 18u, 43u, 36u), uint4(20u, 20u, 46u, 31u), uint4(21u, 19u, 43u, 37u), uint4(21u, 19u, 44u, 36u), uint4(21u, 19u, 44u, 37u), uint4(22u, 18u, 44u, 37u), uint4(22u, 18u, 44u, 38u), uint4(22u, 18u, 45u, 37u), uint4(22u, 19u, 45u, 38u), uint4(21u, 21u, 40u, 48u), uint4(22u, 20u, 45u, 39u), uint4(22u, 20u, 46u, 38u), uint4(20u, 24u, 46u, 39u), uint4(23u, 19u, 41u, 49u), uint4(23u, 19u, 46u, 40u), uint4(23u, 19u, 47u, 39u), uint4(23u, 20u, 47u, 40u), uint4(23u, 20u, 43u, 48u), uint4(23u, 20u, 47u, 41u), uint4(23u, 21u, 47u, 42u), uint4(21u, 25u, 48u, 40u), uint4(23u, 22u, 48u, 41u), uint4(23u, 22u, 48u, 42u), uint4(24u, 20u, 47u, 45u), uint4(24u, 20u, 49u, 41u), uint4(24u, 21u, 49u, 42u), uint4(24u, 21u, 49u, 43u), uint4(24u, 22u, 47u, 48u), uint4(24u, 22u, 50u, 42u), uint4(24u, 22u, 50u, 43u), uint4(23u, 25u, 50u, 44u), uint4(25u, 21u, 48u, 48u), uint4(25u, 21u, 51u, 43u), uint4(25u, 22u, 51u, 44u), uint4(24u, 24u, 51u, 45u), uint4(25u, 23u, 49u, 49u), uint4(25u, 23u, 52u, 44u), uint4(25u, 23u, 52u, 45u), uint4(26u, 22u, 52u, 46u), uint4(26u, 22u, 51u, 48u), uint4(26u, 22u, 53u, 45u), uint4(26u, 23u, 53u, 46u), uint4(25u, 25u, 53u, 47u), uint4(26u, 24u, 52u, 49u), uint4(26u, 24u, 54u, 46u), uint4(24u, 28u, 54u, 47u), uint4(27u, 23u, 57u, 42u), uint4(27u, 23u, 54u, 48u), uint4(27u, 23u, 55u, 47u), uint4(27u, 24u, 55u, 48u), uint4(27u, 24u, 58u, 43u), uint4(27u, 24u, 55u, 49u), uint4(27u, 25u, 56u, 48u), uint4(25u, 29u, 56u, 49u), uint4(27u, 26u, 59u, 44u), uint4(27u, 26u, 56u, 50u), uint4(28u, 24u, 57u, 49u), uint4(28u, 24u, 57u, 50u), uint4(28u, 25u, 60u, 45u), uint4(28u, 25u, 57u, 51u), uint4(28u, 26u, 58u, 50u), uint4(28u, 26u, 58u, 51u), uint4(28u, 26u, 61u, 46u), uint4(27u, 29u, 58u, 52u), uint4(29u, 25u, 59u, 51u), uint4(29u, 25u, 59u, 52u), uint4(29u, 26u, 62u, 47u), uint4(28u, 28u, 59u, 53u), uint4(29u, 27u, 60u, 52u), uint4(29u, 27u, 60u, 53u), uint4(29u, 27u, 60u, 53u), uint4(30u, 26u, 60u, 54u), uint4(30u, 26u, 61u, 53u), uint4(30u, 26u, 61u, 54u), uint4(30u, 27u, 61u, 54u), uint4(29u, 29u, 61u, 55u), uint4(30u, 28u, 62u, 54u), uint4(30u, 28u, 62u, 55u), uint4(30u, 28u, 62u, 55u), uint4(31u, 27u, 62u, 56u), uint4(31u, 27u, 63u, 55u), uint4(31u, 27u, 63u, 56u), uint4(31u, 28u, 63u, 56u), uint4(31u, 28u, 63u, 57u), uint4(31u, 28u, 63u, 58u), uint4(31u, 29u, 63u, 59u), uint4(31u, 29u, 63u, 59u), uint4(31u, 30u, 63u, 60u), uint4(31u, 30u, 63u, 61u), uint4(31u, 30u, 63u, 62u), uint4(31u, 31u, 63u, 62u), uint4(31u, 31u, 63u, 63u) });
constant spvUnsafeArray<float, 6> _1070 = spvUnsafeArray<float, 6>({ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 });
constant spvUnsafeArray<float, 4> _1384 = spvUnsafeArray<float, 4>({ 3.0, 0.0, 2.0, 1.0 });
constant spvUnsafeArray<int, 4> _1394 = spvUnsafeArray<int, 4>({ 589824, 2304, 262402, 66562 });

struct main0_out
{
    uint4 fragColor [[color(0)]];
};

static inline __attribute__((always_inline))
void fetchBlock(thread float4& gl_FragCoord, constant mipMapGenParams& _419, texture2d<float> tex, sampler texSmplr, thread spvUnsafeArray<float3, 16>& block, thread spvUnsafeArray<float, 16>& blockAlpha)
{
    int2 baseCoord = (int2(4) * int2(gl_FragCoord.xy)) + _419.offset;
    for (int by = 0; by < 4; by++)
    {
        for (int bx = 0; bx < 4; bx++)
        {
            int2 coord = baseCoord + int2(bx, by);
            float4 color = tex.read(uint2(coord), 0);
            block[(by * 4) + bx] = color.xyz;
            blockAlpha[(by * 4) + bx] = color.w;
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

static inline __attribute__((always_inline))
uint2 stb_CompressAlphaBlock(thread spvUnsafeArray<float, 16>& blockAlpha)
{
    float minAlpha = blockAlpha[0];
    float maxAlpha = blockAlpha[0];
    for (int i = 1; i < 16; i++)
    {
        minAlpha = fast::min(minAlpha, blockAlpha[i]);
        maxAlpha = fast::max(maxAlpha, blockAlpha[i]);
    }
    float param = minAlpha;
    float param_1 = maxAlpha;
    uint _785 = EmitAlphaEndPointsYCoCgDXT5(param, param_1);
    minAlpha = param;
    maxAlpha = param_1;
    uint2 result;
    result.x = _785;
    float param_2 = minAlpha;
    float param_3 = maxAlpha;
    uint2 indices = EmitAlphaIndicesYCoCgDXT5(param_2, param_3, blockAlpha);
    result.x |= indices.x;
    result.y = indices.y;
    return result;
}

static inline __attribute__((always_inline))
uint2 getOMatch5(thread const int& c)
{
    return _387[c].xy;
}

static inline __attribute__((always_inline))
uint2 getOMatch6(thread const int& c)
{
    return _387[c].zw;
}

static inline __attribute__((always_inline))
uint stb_As16Bit(thread const float3& c)
{
    uint3 u = uint3((c * 255.0) + float3(0.5));
    u = (u * uint3(31u, 63u, 31u)) + uint3(128u);
    u = (u + (u >> uint3(int3(8)))) >> uint3(int3(8));
    return ((u.x << uint(11)) + (u.y << uint(5))) + u.z;
}

static inline __attribute__((always_inline))
uint2 stb_OptimizeColorsBlock(thread spvUnsafeArray<float3, 16>& block)
{
    float3 maxv = block[0];
    float3 minv = block[0];
    float3 muv = block[0];
    for (int i = 1; i < 16; i++)
    {
        muv += block[i];
        minv = fast::min(minv, block[i]);
        maxv = fast::max(maxv, block[i]);
    }
    muv *= 0.0625;
    spvUnsafeArray<float, 6> cov = spvUnsafeArray<float, 6>({ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 });
    for (int i_1 = 0; i_1 < 16; i_1++)
    {
        float3 d = block[i_1] - muv;
        cov[0] += (d.x * d.x);
        cov[1] += (d.x * d.y);
        cov[2] += (d.x * d.z);
        cov[3] += (d.y * d.y);
        cov[4] += (d.y * d.z);
        cov[5] += (d.z * d.z);
    }
    for (int i_2 = 0; i_2 < 6; i_2++)
    {
        cov[i_2] *= 255.0;
    }
    float3 vf = floor(((maxv - minv) * 255.0) + float3(0.5));
    for (int iter = 0; iter < 4; iter++)
    {
        float r = dot(vf, float3(cov[0], cov[1], cov[2]));
        float g = dot(vf, float3(cov[1], cov[3], cov[4]));
        float b = dot(vf, float3(cov[2], cov[4], cov[5]));
        vf = float3(r, g, b);
    }
    float magn = fast::max(abs(vf.x), fast::max(abs(vf.y), abs(vf.z)));
    float3 v_rgb;
    if (magn < 4.0)
    {
        v_rgb = float3(299.0, 587.0, 114.0);
    }
    else
    {
        v_rgb = vf * (512.0 / magn);
    }
    float3 minb = block[0];
    float3 maxb = block[0];
    float _1246 = dot(block[0], v_rgb);
    float mind = _1246;
    float maxd = _1246;
    for (int i_3 = 1; i_3 < 16; i_3++)
    {
        float d_1 = dot(block[i_3], v_rgb);
        if (d_1 < mind)
        {
            mind = d_1;
            minb = block[i_3];
        }
        if (d_1 > maxd)
        {
            maxd = d_1;
            maxb = block[i_3];
        }
    }
    float3 param = maxb;
    float3 param_1 = minb;
    return uint2(stb_As16Bit(param), stb_As16Bit(param_1));
}

static inline __attribute__((always_inline))
uint3 stb_From16Bit(thread const uint& v)
{
    int rv = int((v & 63488u) >> uint(11));
    int gv = int((v & 2016u) >> uint(5));
    int bv = int((v & 31u) >> uint(0));
    uint3 c = uint3(uint(rv), uint(gv), uint(bv));
    return (c << uint3(int3(3, 2, 3))) | (c >> uint3(int3(2, 4, 2)));
}

static inline __attribute__((always_inline))
uint3 stb_Lerp13RGB(thread const uint3& a, thread const uint3& b)
{
    return (((uint3(2u) * a) + b) * uint3(43691u)) >> uint3(int3(17));
}

static inline __attribute__((always_inline))
void stb_EvalColors(thread const uint& c0, thread const uint& c1, thread spvUnsafeArray<uint3, 4>& colors)
{
    uint param = c0;
    colors[0] = stb_From16Bit(param);
    uint param_1 = c1;
    colors[1] = stb_From16Bit(param_1);
    uint3 param_2 = colors[0];
    uint3 param_3 = colors[1];
    colors[2] = stb_Lerp13RGB(param_2, param_3);
    uint3 param_4 = colors[1];
    uint3 param_5 = colors[0];
    colors[3] = stb_Lerp13RGB(param_4, param_5);
}

static inline __attribute__((always_inline))
uint stb_MatchColorsBlock(thread spvUnsafeArray<float3, 16>& block, thread spvUnsafeArray<uint3, 4>& colors)
{
    uint mask = 0u;
    float3 dir = float3(colors[0]) - float3(colors[1]);
    spvUnsafeArray<float, 16> dots;
    for (int i = 0; i < 16; i++)
    {
        dots[i] = dot(block[i], dir);
    }
    dir *= 0.0039215688593685626983642578125;
    spvUnsafeArray<float, 4> stops;
    for (int i_1 = 0; i_1 < 4; i_1++)
    {
        stops[i_1] = dot(float3(colors[i_1]), dir);
    }
    float c0Point = (stops[1] + stops[3]) * 0.5;
    float halfPoint = (stops[3] + stops[2]) * 0.5;
    float c3Point = (stops[2] + stops[0]) * 0.5;
    if (true)
    {
        for (int i_2 = 15; i_2 >= 0; i_2--)
        {
            float d = dots[i_2];
            mask = mask << uint(2);
            if (d < halfPoint)
            {
                mask |= uint((d < c0Point) ? 1 : 3);
            }
            else
            {
                mask |= uint((d < c3Point) ? 2 : 0);
            }
        }
    }
    return mask;
}

static inline __attribute__((always_inline))
bool stb_RefineBlock(thread uint& pmax16, thread uint& pmin16, thread const uint& mask, thread spvUnsafeArray<float3, 16>& block)
{
    uint oldMin = pmin16;
    uint oldMax = pmax16;
    uint max16;
    uint min16;
    if ((mask ^ (mask << uint(2))) < 4u)
    {
        float3 c = float3(0.0);
        for (int i = 0; i < 16; i++)
        {
            c += block[i];
        }
        int3 rgb = int3((c * 15.9375) + float3(0.5));
        int param = rgb.x;
        int param_1 = rgb.y;
        int param_2 = rgb.z;
        max16 = ((getOMatch5(param).x << uint(11)) | (getOMatch6(param_1).x << uint(5))) | getOMatch5(param_2).x;
        int param_3 = rgb.x;
        int param_4 = rgb.y;
        int param_5 = rgb.z;
        min16 = ((getOMatch5(param_3).y << uint(11)) | (getOMatch6(param_4).y << uint(5))) | getOMatch5(param_5).y;
    }
    else
    {
        float3 At1 = float3(0.0);
        float3 At2 = float3(0.0);
        int akku = 0;
        uint cm = mask;
        int i_1 = 0;
        for (; i_1 < 16; i_1++, cm = cm >> uint(2))
        {
            uint _step = cm & 3u;
            float w1 = _1384[_step];
            akku += _1394[_step];
            At1 += (block[i_1] * w1);
            At2 += block[i_1];
        }
        At2 = (At2 * 3.0) - At1;
        float xx = float(akku >> 16);
        float yy = float((akku >> 8) & 255);
        float xy = float((akku >> 0) & 255);
        float frb = 93.0 / ((xx * yy) - (xy * xy));
        float fg = frb * 2.03225803375244140625;
        max16 = uint(fast::clamp((((At1.x * yy) - (At2.x * xy)) * frb) + 0.5, 0.0, 31.0)) << uint(11);
        max16 |= (uint(fast::clamp((((At1.y * yy) - (At2.y * xy)) * fg) + 0.5, 0.0, 63.0)) << uint(5));
        max16 |= (uint(fast::clamp((((At1.z * yy) - (At2.z * xy)) * frb) + 0.5, 0.0, 31.0)) << uint(0));
        min16 = uint(fast::clamp((((At2.x * xx) - (At1.x * xy)) * frb) + 0.5, 0.0, 31.0)) << uint(11);
        min16 |= (uint(fast::clamp((((At2.y * xx) - (At1.y * xy)) * fg) + 0.5, 0.0, 63.0)) << uint(5));
        min16 |= (uint(fast::clamp((((At2.z * xx) - (At1.z * xy)) * frb) + 0.5, 0.0, 31.0)) << uint(0));
    }
    pmin16 = min16;
    pmax16 = max16;
    return any(uint2(oldMin, oldMax) != uint2(min16, max16));
}

static inline __attribute__((always_inline))
uint2 stb_CompressColorBlock(thread spvUnsafeArray<float3, 16>& block, thread spvUnsafeArray<uint3, 4>& colors)
{
    bool isConstant = true;
    for (int i = 1; i < 16; i++)
    {
        isConstant = all(bool4(block[i] == block[0], isConstant));
    }
    uint mask;
    uint max16;
    uint min16;
    if (isConstant)
    {
        int3 rgb = int3((block[0] * 255.0) + float3(0.5));
        mask = 2863311530u;
        int param = rgb.x;
        int param_1 = rgb.y;
        int param_2 = rgb.z;
        max16 = ((getOMatch5(param).x << uint(11)) | (getOMatch6(param_1).x << uint(5))) | getOMatch5(param_2).x;
        int param_3 = rgb.x;
        int param_4 = rgb.y;
        int param_5 = rgb.z;
        min16 = ((getOMatch5(param_3).y << uint(11)) | (getOMatch6(param_4).y << uint(5))) | getOMatch5(param_5).y;
    }
    else
    {
        uint2 maxmin = stb_OptimizeColorsBlock(block);
        max16 = maxmin.x;
        min16 = maxmin.y;
        if (max16 != min16)
        {
            uint param_6 = max16;
            uint param_7 = min16;
            stb_EvalColors(param_6, param_7, colors);
            mask = stb_MatchColorsBlock(block, colors);
        }
        else
        {
            mask = 0u;
        }
        uint param_8 = max16;
        uint param_9 = min16;
        uint param_10 = mask;
        bool _1667 = stb_RefineBlock(param_8, param_9, param_10, block);
        max16 = param_8;
        min16 = param_9;
        if (_1667)
        {
            if (max16 != min16)
            {
                uint param_11 = max16;
                uint param_12 = min16;
                stb_EvalColors(param_11, param_12, colors);
                mask = stb_MatchColorsBlock(block, colors);
            }
            else
            {
                mask = 0u;
            }
        }
    }
    uint2 result;
    if (max16 < min16)
    {
        result.x = min16 | (max16 << uint(16));
        result.y = mask ^ 1431655765u;
    }
    else
    {
        result.x = max16 | (min16 << uint(16));
        result.y = mask;
    }
    return result;
}

fragment main0_out main0(constant mipMapGenParams& _419 [[buffer(0)]], texture2d<float> tex [[texture(0)]], sampler texSmplr [[sampler(0)]], float4 gl_FragCoord [[position]])
{
    main0_out out = {};
    spvUnsafeArray<float3, 16> block;
    spvUnsafeArray<float, 16> blockAlpha;
    fetchBlock(gl_FragCoord, _419, tex, texSmplr, block, blockAlpha);
    uint2 alphaBlock = stb_CompressAlphaBlock(blockAlpha);
    spvUnsafeArray<uint3, 4> colors;
    uint2 _1714 = stb_CompressColorBlock(block, colors);
    uint2 colorBlock = _1714;
    uint4 _1721;
    if (_419.noAlphaBlock != 0u)
    {
        _1721 = uint4(colorBlock.x, colorBlock.y, 0u, 0u);
    }
    else
    {
        _1721 = uint4(alphaBlock.x, alphaBlock.y, colorBlock.x, colorBlock.y);
    }
    out.fragColor = _1721;
    return out;
}

