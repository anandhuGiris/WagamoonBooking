using System.Text.RegularExpressions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.StayCategories;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Application.Services;

public class StayCategoryService : IStayCategoryService
{
    private readonly IApplicationDbContext _context;
    private readonly IValidator<CreateStayCategoryDto> _createValidator;
    private readonly IValidator<UpdateStayCategoryDto> _updateValidator;

    public StayCategoryService(
        IApplicationDbContext context,
        IValidator<CreateStayCategoryDto> createValidator,
        IValidator<UpdateStayCategoryDto> updateValidator)
    {
        _context = context;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<ApiResponse<List<StayCategoryDto>>> GetAllCategoriesAsync(bool? activeOnly = null, CancellationToken ct = default)
    {
        var query = _context.StayCategories
            .Include(c => c.Properties)
            .AsNoTracking();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(c => c.IsActive);
        }

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new StayCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                IsActive = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                PropertyCount = c.Properties.Count,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(ct);

        return ApiResponse<List<StayCategoryDto>>.SuccessResult(categories);
    }

    public async Task<ApiResponse<StayCategoryDto>> GetCategoryByIdAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _context.StayCategories
            .Include(c => c.Properties)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category == null)
        {
            return ApiResponse<StayCategoryDto>.FailureResult("Stay category not found.");
        }

        return ApiResponse<StayCategoryDto>.SuccessResult(new StayCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder,
            PropertyCount = category.Properties.Count,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        });
    }

    public async Task<ApiResponse<StayCategoryDto>> CreateCategoryAsync(CreateStayCategoryDto dto, CancellationToken ct = default)
    {
        var validation = await _createValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<StayCategoryDto>.FailureResult("Validation failed.", errors);
        }

        var name = dto.Name.Trim();
        var slug = GenerateSlug(string.IsNullOrWhiteSpace(dto.Slug) ? name : dto.Slug);

        var nameExists = await _context.StayCategories.AnyAsync(c => c.Name.ToLower() == name.ToLower(), ct);
        if (nameExists)
        {
            return ApiResponse<StayCategoryDto>.FailureResult($"A category with name '{name}' already exists.");
        }

        var slugExists = await _context.StayCategories.AnyAsync(c => c.Slug.ToLower() == slug.ToLower(), ct);
        if (slugExists)
        {
            return ApiResponse<StayCategoryDto>.FailureResult($"A category with slug '{slug}' already exists.");
        }

        var category = new StayCategory
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = slug,
            Description = dto.Description?.Trim(),
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        await _context.StayCategories.AddAsync(category, ct);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<StayCategoryDto>.SuccessResult(new StayCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder,
            PropertyCount = 0,
            CreatedAt = category.CreatedAt
        }, "Category created successfully.");
    }

    public async Task<ApiResponse<StayCategoryDto>> UpdateCategoryAsync(Guid id, UpdateStayCategoryDto dto, CancellationToken ct = default)
    {
        var validation = await _updateValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<StayCategoryDto>.FailureResult("Validation failed.", errors);
        }

        var category = await _context.StayCategories
            .Include(c => c.Properties)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category == null)
        {
            return ApiResponse<StayCategoryDto>.FailureResult("Stay category not found.");
        }

        var name = dto.Name.Trim();
        var slug = GenerateSlug(string.IsNullOrWhiteSpace(dto.Slug) ? name : dto.Slug);

        var duplicateName = await _context.StayCategories.AnyAsync(c => c.Id != id && c.Name.ToLower() == name.ToLower(), ct);
        if (duplicateName)
        {
            return ApiResponse<StayCategoryDto>.FailureResult($"A category with name '{name}' already exists.");
        }

        var duplicateSlug = await _context.StayCategories.AnyAsync(c => c.Id != id && c.Slug.ToLower() == slug.ToLower(), ct);
        if (duplicateSlug)
        {
            return ApiResponse<StayCategoryDto>.FailureResult($"A category with slug '{slug}' already exists.");
        }

        category.Name = name;
        category.Slug = slug;
        category.Description = dto.Description?.Trim();
        category.IsActive = dto.IsActive;
        category.DisplayOrder = dto.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return ApiResponse<StayCategoryDto>.SuccessResult(new StayCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder,
            PropertyCount = category.Properties.Count,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        }, "Category updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteCategoryAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _context.StayCategories.FirstOrDefaultAsync(c => c.Id == id, ct);
        if (category == null)
        {
            return ApiResponse<bool>.FailureResult("Stay category not found.");
        }

        var assignedPropertyCount = await _context.Properties.CountAsync(p => p.CategoryId == id, ct);
        if (assignedPropertyCount > 0)
        {
            return ApiResponse<bool>.FailureResult(
                $"Cannot delete category '{category.Name}' because {assignedPropertyCount} {(assignedPropertyCount == 1 ? "property is" : "properties are")} currently assigned to it. Please reassign the properties first.");
        }

        _context.StayCategories.Remove(category);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Category deleted successfully.");
    }

    public async Task<ApiResponse<StayCategoryDto>> ToggleStatusAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _context.StayCategories
            .Include(c => c.Properties)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category == null)
        {
            return ApiResponse<StayCategoryDto>.FailureResult("Stay category not found.");
        }

        category.IsActive = !category.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return ApiResponse<StayCategoryDto>.SuccessResult(new StayCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            IsActive = category.IsActive,
            DisplayOrder = category.DisplayOrder,
            PropertyCount = category.Properties.Count,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        }, $"Category has been {(category.IsActive ? "activated" : "deactivated")}.");
    }

    public async Task<ApiResponse<List<PublicStayCategoryDto>>> GetPublicCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await _context.StayCategories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .Select(c => new PublicStayCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                DisplayOrder = c.DisplayOrder
            })
            .ToListAsync(ct);

        return ApiResponse<List<PublicStayCategoryDto>>.SuccessResult(categories);
    }

    private static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var slug = text.Trim().ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-");
        return slug.Trim('-');
    }
}

