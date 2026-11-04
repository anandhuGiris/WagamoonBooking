using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Users;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Application.Services;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IValidator<CreateAdminDto> _createValidator;
    private readonly IValidator<UpdateAdminDto> _updateValidator;

    public UserService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IValidator<CreateAdminDto> createValidator,
        IValidator<UpdateAdminDto> updateValidator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<ApiResponse<List<AdminUserDto>>> GetAdminsAsync(CancellationToken ct = default)
    {
        var users = await _context.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            })
            .ToListAsync(ct);

        return ApiResponse<List<AdminUserDto>>.SuccessResult(users);
    }

    public async Task<ApiResponse<AdminUserDto>> GetAdminByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id, ct);

        if (user == null)
        {
            return ApiResponse<AdminUserDto>.FailureResult("Admin user not found.");
        }

        var dto = new AdminUserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return ApiResponse<AdminUserDto>.SuccessResult(dto);
    }

    public async Task<ApiResponse<AdminUserDto>> CreateAdminAsync(CreateAdminDto dto, CancellationToken ct = default)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage))
                .ToList();
            return ApiResponse<AdminUserDto>.FailureResult("Validation failed.", errors);
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var emailExists = await _context.Users
            .AnyAsync(u => u.Email.ToLower() == normalizedEmail, ct);

        if (emailExists)
        {
            return ApiResponse<AdminUserDto>.FailureResult("An administrator with this email address already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Role = string.IsNullOrWhiteSpace(dto.Role) ? "Admin" : dto.Role.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user, ct);
        await _context.SaveChangesAsync(ct);

        var resultDto = new AdminUserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return ApiResponse<AdminUserDto>.SuccessResult(resultDto, "Admin user created successfully.");
    }

    public async Task<ApiResponse<AdminUserDto>> UpdateAdminAsync(Guid id, UpdateAdminDto dto, CancellationToken ct = default)
    {
        var validationResult = await _updateValidator.ValidateAsync(dto, ct);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage))
                .ToList();
            return ApiResponse<AdminUserDto>.FailureResult("Validation failed.", errors);
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
        {
            return ApiResponse<AdminUserDto>.FailureResult("Admin user not found.");
        }

        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
        var emailTaken = await _context.Users
            .AnyAsync(u => u.Id != id && u.Email.ToLower() == normalizedEmail, ct);

        if (emailTaken)
        {
            return ApiResponse<AdminUserDto>.FailureResult("This email address is already in use by another user.");
        }

        user.Name = dto.Name.Trim();
        user.Email = normalizedEmail;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(dto.Role))
        {
            user.Role = dto.Role.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = _passwordHasher.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync(ct);

        var resultDto = new AdminUserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };

        return ApiResponse<AdminUserDto>.SuccessResult(resultDto, "Admin user updated successfully.");
    }

    public async Task<ApiResponse<bool>> ToggleStatusAsync(Guid id, Guid currentUserId, CancellationToken ct = default)
    {
        if (id == currentUserId)
        {
            return ApiResponse<bool>.FailureResult("You cannot deactivate your own administrator account.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
        {
            return ApiResponse<bool>.FailureResult("Admin user not found.");
        }

        // If deactivating, ensure we're not deactivating the last active admin
        if (user.IsActive)
        {
            var activeAdminCount = await _context.Users.CountAsync(u => u.IsActive && u.Role == "Admin", ct);
            if (activeAdminCount <= 1)
            {
                return ApiResponse<bool>.FailureResult("Cannot deactivate the only remaining active administrator.");
            }
        }

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        var message = user.IsActive ? "Administrator activated successfully." : "Administrator deactivated successfully.";
        return ApiResponse<bool>.SuccessResult(user.IsActive, message);
    }

    public async Task<ApiResponse<bool>> DeleteAdminAsync(Guid id, Guid currentUserId, CancellationToken ct = default)
    {
        if (id == currentUserId)
        {
            return ApiResponse<bool>.FailureResult("You cannot delete your own administrator account.");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
        {
            return ApiResponse<bool>.FailureResult("Admin user not found.");
        }

        var activeAdminCount = await _context.Users.CountAsync(u => u.IsActive && u.Role == "Admin", ct);
        if (activeAdminCount <= 1 && user.IsActive)
        {
            return ApiResponse<bool>.FailureResult("Cannot delete the only remaining active administrator.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Administrator deleted successfully.");
    }
}

