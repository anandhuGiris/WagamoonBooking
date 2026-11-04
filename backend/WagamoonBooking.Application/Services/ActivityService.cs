using System.Text.RegularExpressions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Application.Services;

public class ActivityService : IActivityService
{
    private readonly IApplicationDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly IValidator<CreateActivityDto> _createValidator;
    private readonly IValidator<UpdateActivityDto> _updateValidator;

    public ActivityService(
        IApplicationDbContext context,
        ICloudinaryService cloudinaryService,
        IValidator<CreateActivityDto> createValidator,
        IValidator<UpdateActivityDto> updateValidator)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<ApiResponse<PagedResult<ActivityDto>>> GetActivitiesAsync(
        int page,
        int pageSize,
        string? search,
        bool? activeOnly,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Activities
            .Include(a => a.Images)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var cleanSearch = search.Trim().ToLower();
            query = query.Where(a => a.Name.ToLower().Contains(cleanSearch) || a.Location.ToLower().Contains(cleanSearch));
        }

        if (activeOnly.HasValue)
        {
            query = query.Where(a => a.IsActive == activeOnly.Value);
        }

        var totalCount = await query.CountAsync(ct);

        var activities = await query
            .OrderBy(a => a.DisplayOrder)
            .ThenByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ActivityDto
            {
                Id = a.Id,
                Name = a.Name,
                Slug = a.Slug,
                Description = a.Description,
                Location = a.Location,
                Duration = a.Duration,
                Price = a.Price,
                WhatsAppNumber = a.WhatsAppNumber,
                IsActive = a.IsActive,
                DisplayOrder = a.DisplayOrder,
                PrimaryImageUrl = a.Images.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault()
                    ?? a.Images.OrderBy(img => img.SortOrder).Select(img => img.ImageUrl).FirstOrDefault(),
                ImageCount = a.Images.Count,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt
            })
            .ToListAsync(ct);

        var result = new PagedResult<ActivityDto>(activities, totalCount, page, pageSize);
        return ApiResponse<PagedResult<ActivityDto>>.SuccessResult(result);
    }

    public async Task<ApiResponse<ActivityDetailDto>> GetActivityByIdAsync(Guid id, CancellationToken ct = default)
    {
        var activity = await _context.Activities
            .Include(a => a.Images)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, ct);

        if (activity == null)
        {
            return ApiResponse<ActivityDetailDto>.FailureResult("Activity not found.");
        }

        var detailDto = new ActivityDetailDto
        {
            Id = activity.Id,
            Name = activity.Name,
            Slug = activity.Slug,
            Description = activity.Description,
            Location = activity.Location,
            Duration = activity.Duration,
            Price = activity.Price,
            WhatsAppNumber = activity.WhatsAppNumber,
            IsActive = activity.IsActive,
            DisplayOrder = activity.DisplayOrder,
            CreatedAt = activity.CreatedAt,
            UpdatedAt = activity.UpdatedAt,
            Images = activity.Images
                .OrderBy(img => img.SortOrder)
                .ThenBy(img => img.CreatedAt)
                .Select(img => new ActivityImageDto
                {
                    Id = img.Id,
                    ActivityId = img.ActivityId,
                    ImageUrl = img.ImageUrl,
                    PublicId = img.PublicId,
                    SortOrder = img.SortOrder,
                    IsPrimary = img.IsPrimary,
                    CreatedAt = img.CreatedAt
                })
                .ToList()
        };

        return ApiResponse<ActivityDetailDto>.SuccessResult(detailDto);
    }

    public async Task<ApiResponse<ActivityDetailDto>> CreateActivityAsync(CreateActivityDto dto, CancellationToken ct = default)
    {
        var validation = await _createValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<ActivityDetailDto>.FailureResult("Validation failed.", errors);
        }

        var name = dto.Name.Trim();
        var slug = GenerateSlug(string.IsNullOrWhiteSpace(dto.Slug) ? name : dto.Slug);

        var slugExists = await _context.Activities.AnyAsync(a => a.Slug.ToLower() == slug.ToLower(), ct);
        if (slugExists)
        {
            return ApiResponse<ActivityDetailDto>.FailureResult($"An activity with slug '{slug}' already exists.");
        }

        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            Name = name,
            Slug = slug,
            Description = dto.Description.Trim(),
            Location = dto.Location.Trim(),
            Duration = dto.Duration?.Trim(),
            Price = dto.Price,
            WhatsAppNumber = string.IsNullOrWhiteSpace(dto.WhatsAppNumber) ? null : dto.WhatsAppNumber.Trim(),
            IsActive = dto.IsActive,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Activities.AddAsync(activity, ct);
        await _context.SaveChangesAsync(ct);

        return await GetActivityByIdAsync(activity.Id, ct);
    }

    public async Task<ApiResponse<ActivityDetailDto>> UpdateActivityAsync(Guid id, UpdateActivityDto dto, CancellationToken ct = default)
    {
        var validation = await _updateValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<ActivityDetailDto>.FailureResult("Validation failed.", errors);
        }

        var activity = await _context.Activities.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (activity == null)
        {
            return ApiResponse<ActivityDetailDto>.FailureResult("Activity not found.");
        }

        var name = dto.Name.Trim();
        var slug = GenerateSlug(string.IsNullOrWhiteSpace(dto.Slug) ? name : dto.Slug);

        var duplicateSlug = await _context.Activities.AnyAsync(a => a.Id != id && a.Slug.ToLower() == slug.ToLower(), ct);
        if (duplicateSlug)
        {
            return ApiResponse<ActivityDetailDto>.FailureResult($"An activity with slug '{slug}' already exists.");
        }

        activity.Name = name;
        activity.Slug = slug;
        activity.Description = dto.Description.Trim();
        activity.Location = dto.Location.Trim();
        activity.Duration = dto.Duration?.Trim();
        activity.Price = dto.Price;
        activity.WhatsAppNumber = string.IsNullOrWhiteSpace(dto.WhatsAppNumber) ? null : dto.WhatsAppNumber.Trim();
        activity.IsActive = dto.IsActive;
        activity.DisplayOrder = dto.DisplayOrder;
        activity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return await GetActivityByIdAsync(activity.Id, ct);
    }

    public async Task<ApiResponse<bool>> DeleteActivityAsync(Guid id, CancellationToken ct = default)
    {
        var activity = await _context.Activities
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == id, ct);

        if (activity == null)
        {
            return ApiResponse<bool>.FailureResult("Activity not found.");
        }

        // Clean up Cloudinary images if stored
        foreach (var img in activity.Images)
        {
            if (!string.IsNullOrEmpty(img.PublicId))
            {
                try
                {
                    await _cloudinaryService.DeleteImageAsync(img.PublicId, ct);
                }
                catch
                {
                    // Ignore image delete failures during entity deletion
                }
            }
        }

        _context.Activities.Remove(activity);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Activity deleted successfully.");
    }

    public async Task<ApiResponse<ActivityDetailDto>> ToggleStatusAsync(Guid id, CancellationToken ct = default)
    {
        var activity = await _context.Activities.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (activity == null)
        {
            return ApiResponse<ActivityDetailDto>.FailureResult("Activity not found.");
        }

        activity.IsActive = !activity.IsActive;
        activity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return await GetActivityByIdAsync(activity.Id, ct);
    }

    public async Task<ApiResponse<ActivityImageDto>> AddImageAsync(
        Guid activityId,
        string imageUrl,
        string? publicId,
        bool isPrimary = false,
        CancellationToken ct = default)
    {
        var activity = await _context.Activities
            .Include(a => a.Images)
            .FirstOrDefaultAsync(a => a.Id == activityId, ct);

        if (activity == null)
        {
            return ApiResponse<ActivityImageDto>.FailureResult("Activity not found.");
        }

        if (isPrimary || activity.Images.Count == 0)
        {
            foreach (var img in activity.Images)
            {
                img.IsPrimary = false;
            }
            isPrimary = true;
        }

        var maxSortOrder = activity.Images.Any() ? activity.Images.Max(i => i.SortOrder) + 1 : 0;

        var newImage = new ActivityImage
        {
            Id = Guid.NewGuid(),
            ActivityId = activityId,
            ImageUrl = imageUrl,
            PublicId = publicId,
            SortOrder = maxSortOrder,
            IsPrimary = isPrimary,
            CreatedAt = DateTime.UtcNow
        };

        await _context.ActivityImages.AddAsync(newImage, ct);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<ActivityImageDto>.SuccessResult(new ActivityImageDto
        {
            Id = newImage.Id,
            ActivityId = newImage.ActivityId,
            ImageUrl = newImage.ImageUrl,
            PublicId = newImage.PublicId,
            SortOrder = newImage.SortOrder,
            IsPrimary = newImage.IsPrimary,
            CreatedAt = newImage.CreatedAt
        }, "Image added successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteImageAsync(Guid activityId, Guid imageId, CancellationToken ct = default)
    {
        var image = await _context.ActivityImages.FirstOrDefaultAsync(i => i.Id == imageId && i.ActivityId == activityId, ct);
        if (image == null)
        {
            return ApiResponse<bool>.FailureResult("Image not found.");
        }

        var wasPrimary = image.IsPrimary;

        if (!string.IsNullOrEmpty(image.PublicId))
        {
            await _cloudinaryService.DeleteImageAsync(image.PublicId, ct);
        }

        _context.ActivityImages.Remove(image);
        await _context.SaveChangesAsync(ct);

        // If the removed image was primary, appoint next available image as primary
        if (wasPrimary)
        {
            var nextImage = await _context.ActivityImages
                .Where(i => i.ActivityId == activityId)
                .OrderBy(i => i.SortOrder)
                .FirstOrDefaultAsync(ct);

            if (nextImage != null)
            {
                nextImage.IsPrimary = true;
                await _context.SaveChangesAsync(ct);
            }
        }

        return ApiResponse<bool>.SuccessResult(true, "Image deleted successfully.");
    }

    public async Task<ApiResponse<bool>> SetPrimaryImageAsync(Guid activityId, Guid imageId, CancellationToken ct = default)
    {
        var images = await _context.ActivityImages.Where(i => i.ActivityId == activityId).ToListAsync(ct);
        var targetImage = images.FirstOrDefault(i => i.Id == imageId);

        if (targetImage == null)
        {
            return ApiResponse<bool>.FailureResult("Image not found.");
        }

        foreach (var img in images)
        {
            img.IsPrimary = (img.Id == imageId);
        }

        await _context.SaveChangesAsync(ct);
        return ApiResponse<bool>.SuccessResult(true, "Primary image updated.");
    }

    public async Task<ApiResponse<bool>> ReorderImagesAsync(Guid activityId, List<Guid> imageIds, CancellationToken ct = default)
    {
        var images = await _context.ActivityImages.Where(i => i.ActivityId == activityId).ToListAsync(ct);

        for (int i = 0; i < imageIds.Count; i++)
        {
            var img = images.FirstOrDefault(x => x.Id == imageIds[i]);
            if (img != null)
            {
                img.SortOrder = i;
            }
        }

        await _context.SaveChangesAsync(ct);
        return ApiResponse<bool>.SuccessResult(true, "Images reordered successfully.");
    }

    public async Task<ApiResponse<List<PublicActivityDto>>> GetPublicActivitiesAsync(CancellationToken ct = default)
    {
        var activities = await _context.Activities
            .Where(a => a.IsActive)
            .Include(a => a.Images)
            .AsNoTracking()
            .OrderBy(a => a.DisplayOrder)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        var dtoList = activities.Select(MapToPublicDto).ToList();
        return ApiResponse<List<PublicActivityDto>>.SuccessResult(dtoList);
    }

    public async Task<ApiResponse<PublicActivityDto>> GetPublicActivityByIdAsync(Guid id, CancellationToken ct = default)
    {
        var activity = await _context.Activities
            .Where(a => a.IsActive && a.Id == id)
            .Include(a => a.Images)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);

        if (activity == null)
        {
            return ApiResponse<PublicActivityDto>.FailureResult("Activity not found or is currently inactive.");
        }

        return ApiResponse<PublicActivityDto>.SuccessResult(MapToPublicDto(activity));
    }

    private static PublicActivityDto MapToPublicDto(Activity a)
    {
        string whatsappUrl = string.Empty;
        if (!string.IsNullOrWhiteSpace(a.WhatsAppNumber))
        {
            var cleanNumber = Regex.Replace(a.WhatsAppNumber, @"[^\d]", "");
            var message = Uri.EscapeDataString($"Hi, I'm interested in booking the {a.Name} adventure in Wagamon.");
            whatsappUrl = $"https://wa.me/{cleanNumber}?text={message}";
        }

        return new PublicActivityDto
        {
            Id = a.Id,
            Name = a.Name,
            Slug = a.Slug,
            Description = a.Description,
            Location = a.Location,
            Duration = a.Duration,
            Price = a.Price,
            WhatsAppNumber = a.WhatsAppNumber,
            WhatsAppUrl = whatsappUrl,
            Images = a.Images
                .OrderBy(img => img.SortOrder)
                .ThenBy(img => img.CreatedAt)
                .Select(img => new PublicActivityImageDto
                {
                    Url = img.ImageUrl,
                    IsPrimary = img.IsPrimary,
                    SortOrder = img.SortOrder
                })
                .ToList()
        };
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

