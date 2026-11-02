using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.Auth;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IValidator<LoginRequestDto> _loginValidator;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IValidator<LoginRequestDto> loginValidator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _loginValidator = loginValidator;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request, CancellationToken ct = default)
    {
        var validationResult = await _loginValidator.ValidateAsync(request, ct);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<LoginResponseDto>.FailureResult("Validation failed.", errors);
        }

        var normalizedEmail = request.Email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail, ct);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return ApiResponse<LoginResponseDto>.FailureResult("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            return ApiResponse<LoginResponseDto>.FailureResult("Your account has been deactivated. Please contact an administrator.");
        }

        var (token, expiresAt) = _jwtTokenGenerator.GenerateToken(user);

        var response = new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            }
        };

        return ApiResponse<LoginResponseDto>.SuccessResult(response, "Login successful.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user == null || !user.IsActive)
        {
            return ApiResponse<UserDto>.FailureResult("User not found or inactive.");
        }

        return ApiResponse<UserDto>.SuccessResult(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role
        });
    }
}
