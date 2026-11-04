using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Users;

namespace WagamoonBooking.Application.Interfaces;

public interface IUserService
{
    Task<ApiResponse<List<AdminUserDto>>> GetAdminsAsync(CancellationToken ct = default);
    Task<ApiResponse<AdminUserDto>> GetAdminByIdAsync(Guid id, CancellationToken ct = default);
    Task<ApiResponse<AdminUserDto>> CreateAdminAsync(CreateAdminDto dto, CancellationToken ct = default);
    Task<ApiResponse<AdminUserDto>> UpdateAdminAsync(Guid id, UpdateAdminDto dto, CancellationToken ct = default);
    Task<ApiResponse<bool>> ToggleStatusAsync(Guid id, Guid currentUserId, CancellationToken ct = default);
    Task<ApiResponse<bool>> DeleteAdminAsync(Guid id, Guid currentUserId, CancellationToken ct = default);
}

