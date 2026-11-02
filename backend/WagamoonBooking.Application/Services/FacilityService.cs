using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Facilities;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Application.Services;

public class FacilityService : IFacilityService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateFacilityDto> _createValidator;

    public FacilityService(
        IApplicationDbContext context,
        IValidator<CreateFacilityDto> createValidator)
    {
        _context = context;
        _createValidator = createValidator;
    }

    public async Task<ApiResponse<List<FacilityDto>>> GetAllFacilitiesAsync(bool? activeOnly = null, CancellationToken ct = default)
    {
        var query = _context.Facilities.AsQueryable();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(f => f.IsActive);
        }

        var facilities = await query
            .OrderBy(f => f.Name)
            .Select(f => new FacilityDto
            {
                Id = f.Id,
                Name = f.Name,
                IsActive = f.IsActive,
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            })
            .ToListAsync(ct);

        return ApiResponse<List<FacilityDto>>.SuccessResult(facilities);
    }

    public async Task<ApiResponse<FacilityDto>> CreateFacilityAsync(CreateFacilityDto dto, CancellationToken ct = default)
    {
        var validation = await _createValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<FacilityDto>.FailureResult("Validation failed.", errors);
        }

        var normalized = dto.Name.Trim();
        var exists = await _context.Facilities.AnyAsync(f => f.Name.ToLower() == normalized.ToLower(), ct);
        if (exists)
        {
            return ApiResponse<FacilityDto>.FailureResult($"A facility with name '{normalized}' already exists.");
        }

        var facility = new Facility
        {
            Id = Guid.NewGuid(),
            Name = normalized,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Facilities.AddAsync(facility, ct);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<FacilityDto>.SuccessResult(new FacilityDto
        {
            Id = facility.Id,
            Name = facility.Name,
            IsActive = facility.IsActive,
            CreatedAt = facility.CreatedAt
        }, "Facility created successfully.");
    }

    public async Task<ApiResponse<FacilityDto>> UpdateFacilityAsync(Guid id, UpdateFacilityDto dto, CancellationToken ct = default)
    {
        var facility = await _context.Facilities.FirstOrDefaultAsync(f => f.Id == id, ct);
        if (facility == null)
        {
            return ApiResponse<FacilityDto>.FailureResult("Facility not found.");
        }

        var normalized = dto.Name.Trim();
        var duplicate = await _context.Facilities.AnyAsync(f => f.Id != id && f.Name.ToLower() == normalized.ToLower(), ct);
        if (duplicate)
        {
            return ApiResponse<FacilityDto>.FailureResult($"A facility with name '{normalized}' already exists.");
        }

        facility.Name = normalized;
        facility.IsActive = dto.IsActive;
        facility.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return ApiResponse<FacilityDto>.SuccessResult(new FacilityDto
        {
            Id = facility.Id,
            Name = facility.Name,
            IsActive = facility.IsActive,
            CreatedAt = facility.CreatedAt,
            UpdatedAt = facility.UpdatedAt
        }, "Facility updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteFacilityAsync(Guid id, CancellationToken ct = default)
    {
        var facility = await _context.Facilities.FirstOrDefaultAsync(f => f.Id == id, ct);
        if (facility == null)
        {
            return ApiResponse<bool>.FailureResult("Facility not found.");
        }

        _context.Facilities.Remove(facility);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Facility deleted successfully.");
    }
}
