using WagamoonBooking.Application.DTOs.Auth;
using WagamoonBooking.Application.DTOs.Common;

namespace WagamoonBooking.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken ct = default);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
}
