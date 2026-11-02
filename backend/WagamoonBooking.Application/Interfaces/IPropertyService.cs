using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Dashboard;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Application.DTOs.PropertyImages;
using WagamoonBooking.Domain.Enums;

namespace WagamoonBooking.Application.Interfaces;

public interface IPropertyService
{
    Task<ApiResponse<PagedResult<PropertyDto>>> GetPropertiesAsync(int page, int pageSize, string? search, PropertyStatus? status, CancellationToken ct = default);
    Task<ApiResponse<PropertyDetailDto>> GetPropertyByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<PropertyDetailDto>> CreatePropertyAsync(CreatePropertyDto dto, CancellationToken ct = default);
    Task<ApiResponse<PropertyDetailDto>> UpdatePropertyAsync(Guid id, UpdatePropertyDto dto, CancellationToken ct = default);
    Task<ApiResponse<bool>> DeletePropertyAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<bool>> UpdatePropertyStatusAsync(Guid id, PropertyStatus status, CancellationToken ct = default);

    Task<ApiResponse<PropertyImageDto>> AddImageAsync(Guid propertyId, string imageUrl, string? publicId, bool isPrimary, CancellationToken ct = default);
    Task<ApiResponse<bool>> DeleteImageAsync(Guid propertyId, Guid imageId, CancellationToken ct = default);
    Task<ApiResponse<bool>> SetPrimaryImageAsync(Guid propertyId, Guid imageId, CancellationToken ct = default);
    Task<ApiResponse<bool>> ReorderImagesAsync(Guid propertyId, List<Guid> imageIds, CancellationToken ct = default);

    Task<ApiResponse<List<PublicPropertyDto>>> GetPublicPropertiesAsync(CancellationToken ct = default);
    Task<ApiResponse<PublicPropertyDto>> GetPublicPropertyByIdAsync(Guid id, CancellationToken ct = default);

    Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync(CancellationToken ct = default);
}
