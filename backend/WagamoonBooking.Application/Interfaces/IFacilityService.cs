using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Facilities;

namespace WagamoonBooking.Application.Interfaces;

public interface IFacilityService
{
    Task<ApiResponse<List<FacilityDto>>> GetAllFacilitiesAsync(bool? activeOnly = null, CancellationToken ct = default);
    Task<ApiResponse<FacilityDto>> CreateFacilityAsync(CreateFacilityDto dto, CancellationToken ct = default);
    Task<ApiResponse<FacilityDto>> UpdateFacilityAsync(Guid id, UpdateFacilityDto dto, CancellationToken ct = default);
    Task<ApiResponse<bool>> DeleteFacilityAsync(Guid id, CancellationToken ct = default);
}
