using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.StayCategories;

namespace WagamoonBooking.Application.Interfaces;

public interface IStayCategoryService
{
    Task<ApiResponse<List<StayCategoryDto>>> GetAllCategoriesAsync(bool? activeOnly = null, CancellationToken ct = default);
    Task<ApiResponse<StayCategoryDto>> GetCategoryByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<StayCategoryDto>> CreateCategoryAsync(CreateStayCategoryDto dto, CancellationToken ct = default);
    Task<ApiResponse<StayCategoryDto>> UpdateCategoryAsync(Guid id, UpdateStayCategoryDto dto, CancellationToken ct = default);
    Task<ApiResponse<bool>> DeleteCategoryAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<StayCategoryDto>> ToggleStatusAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<List<PublicStayCategoryDto>>> GetPublicCategoriesAsync(CancellationToken ct = default);
}

