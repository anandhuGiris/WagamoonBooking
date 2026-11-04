using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.DTOs.Common;

namespace WagamoonBooking.Application.Interfaces;

public interface IActivityService
{
    Task<ApiResponse<PagedResult<ActivityDto>>> GetActivitiesAsync(
        int page,
        int pageSize,
        string? search,
        bool? activeOnly,
        CancellationToken ct = default);

    Task<ApiResponse<ActivityDetailDto>> GetActivityByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<ActivityDetailDto>> CreateActivityAsync(CreateActivityDto dto, CancellationToken ct = default);
    Task<ApiResponse<ActivityDetailDto>> UpdateActivityAsync(Guid id, UpdateActivityDto dto, CancellationToken ct = default);
    Task<ApiResponse<bool>> DeleteActivityAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<ActivityDetailDto>> ToggleStatusAsync(Guid id, CancellationToken ct = default);

    Task<ApiResponse<ActivityImageDto>> AddImageAsync(
        Guid activityId,
        string imageUrl,
        string? publicId,
        bool isPrimary = false,
        CancellationToken ct = default);

    Task<ApiResponse<bool>> DeleteImageAsync(Guid activityId, Guid imageId, CancellationToken ct = default);
    Task<ApiResponse<bool>> SetPrimaryImageAsync(Guid activityId, Guid imageId, CancellationToken ct = default);
    Task<ApiResponse<bool>> ReorderImagesAsync(Guid activityId, List<Guid> imageIds, CancellationToken ct = default);

    Task<ApiResponse<List<PublicActivityDto>>> GetPublicActivitiesAsync(CancellationToken ct = default);
    Task<ApiResponse<PublicActivityDto>> GetPublicActivityByIdAsync(Guid id, CancellationToken ct = default);
}

