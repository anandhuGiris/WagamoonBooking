using System.Text.RegularExpressions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Dashboard;
using WagamoonBooking.Application.DTOs.Facilities;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Application.DTOs.PropertyImages;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Domain.Enums;

namespace WagamoonBooking.Application.Services;

public class PropertyService : IPropertyService
{
    private readonly IApplicationDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly IValidator<CreatePropertyDto> _createValidator;
    private readonly IValidator<UpdatePropertyDto> _updateValidator;
    private readonly string _publicWebsiteBaseUrl;

    public PropertyService(
        IApplicationDbContext context,
        ICloudinaryService cloudinaryService,
        IValidator<CreatePropertyDto> createValidator,
        IValidator<UpdatePropertyDto> updateValidator,
        string? publicWebsiteBaseUrl = null)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _publicWebsiteBaseUrl = (publicWebsiteBaseUrl
            ?? Environment.GetEnvironmentVariable("PUBLIC_WEBSITE_BASE_URL")
            ?? "https://wagamoonbooking.com").TrimEnd('/');
    }

    public async Task<ApiResponse<PagedResult<PropertyDto>>> GetPropertiesAsync(
        int page,
        int pageSize,
        string? search,
        PropertyStatus? status,
        Guid? categoryId = null,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Properties
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.PropertyFacilities)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var cleanSearch = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(cleanSearch) || p.Location.ToLower().Contains(cleanSearch));
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        var totalCount = await query.CountAsync(ct);

        var properties = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PropertyDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Location = p.Location,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                CategorySlug = p.Category != null ? p.Category.Slug : string.Empty,
                Bedrooms = p.Bedrooms,
                Bathrooms = p.Bathrooms,
                MaxGuests = p.MaxGuests,
                WhatsAppNumber = p.WhatsAppNumber,
                Status = p.Status,
                PrimaryImageUrl = p.Images.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault()
                    ?? p.Images.OrderBy(img => img.SortOrder).Select(img => img.ImageUrl).FirstOrDefault(),
                FacilityCount = p.PropertyFacilities.Count,
                ImageCount = p.Images.Count,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync(ct);

        var result = new PagedResult<PropertyDto>(properties, totalCount, page, pageSize);
        return ApiResponse<PagedResult<PropertyDto>>.SuccessResult(result);
    }

    public async Task<ApiResponse<PropertyDetailDto>> GetPropertyByIdAsync(Guid id, CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.PropertyFacilities)
                .ThenInclude(pf => pf.Facility)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (property == null)
        {
            return ApiResponse<PropertyDetailDto>.FailureResult("Property not found.");
        }

        var detailDto = new PropertyDetailDto
        {
            Id = property.Id,
            Name = property.Name,
            Description = property.Description,
            Location = property.Location,
            CategoryId = property.CategoryId,
            CategoryName = property.Category != null ? property.Category.Name : string.Empty,
            CategorySlug = property.Category != null ? property.Category.Slug : string.Empty,
            Bedrooms = property.Bedrooms,
            Bathrooms = property.Bathrooms,
            MaxGuests = property.MaxGuests,
            WhatsAppNumber = property.WhatsAppNumber,
            Status = property.Status,
            CreatedAt = property.CreatedAt,
            UpdatedAt = property.UpdatedAt,
            Images = property.Images
                .OrderBy(img => img.SortOrder)
                .ThenBy(img => img.CreatedAt)
                .Select(img => new PropertyImageDto
                {
                    Id = img.Id,
                    PropertyId = img.PropertyId,
                    ImageUrl = img.ImageUrl,
                    PublicId = img.PublicId,
                    SortOrder = img.SortOrder,
                    IsPrimary = img.IsPrimary,
                    CreatedAt = img.CreatedAt
                })
                .ToList(),
            Facilities = property.PropertyFacilities
                .Where(pf => pf.Facility != null)
                .Select(pf => new FacilityDto
                {
                    Id = pf.Facility.Id,
                    Name = pf.Facility.Name,
                    IsActive = pf.Facility.IsActive,
                    CreatedAt = pf.Facility.CreatedAt,
                    UpdatedAt = pf.Facility.UpdatedAt
                })
                .OrderBy(f => f.Name)
                .ToList(),
            FacilityIds = property.PropertyFacilities.Select(pf => pf.FacilityId).ToList()
        };

        return ApiResponse<PropertyDetailDto>.SuccessResult(detailDto);
    }

    public async Task<ApiResponse<PropertyDetailDto>> CreatePropertyAsync(CreatePropertyDto dto, CancellationToken ct = default)
    {
        var validation = await _createValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<PropertyDetailDto>.FailureResult("Validation failed.", errors);
        }

        // Validate that category exists and is active
        var category = await _context.StayCategories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId, ct);
        if (category == null || !category.IsActive)
        {
            return ApiResponse<PropertyDetailDto>.FailureResult("The selected stay category does not exist or is inactive.");
        }

        var property = new Property
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Location = dto.Location.Trim(),
            CategoryId = dto.CategoryId,
            Bedrooms = dto.Bedrooms,
            Bathrooms = dto.Bathrooms,
            MaxGuests = dto.MaxGuests,
            WhatsAppNumber = dto.WhatsAppNumber.Trim(),
            Status = dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        if (dto.FacilityIds != null && dto.FacilityIds.Count > 0)
        {
            var validFacilityIds = await _context.Facilities
                .Where(f => dto.FacilityIds.Contains(f.Id))
                .Select(f => f.Id)
                .ToListAsync(ct);

            foreach (var facId in validFacilityIds)
            {
                property.PropertyFacilities.Add(new PropertyFacility
                {
                    PropertyId = property.Id,
                    FacilityId = facId
                });
            }
        }

        await _context.Properties.AddAsync(property, ct);
        await _context.SaveChangesAsync(ct);

        return await GetPropertyByIdAsync(property.Id, ct);
    }

    public async Task<ApiResponse<PropertyDetailDto>> UpdatePropertyAsync(Guid id, UpdatePropertyDto dto, CancellationToken ct = default)
    {
        var validation = await _updateValidator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => new ValidationErrorDto(e.PropertyName, e.ErrorMessage)).ToList();
            return ApiResponse<PropertyDetailDto>.FailureResult("Validation failed.", errors);
        }

        // Validate that category exists and is active
        var category = await _context.StayCategories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId, ct);
        if (category == null || !category.IsActive)
        {
            return ApiResponse<PropertyDetailDto>.FailureResult("The selected stay category does not exist or is inactive.");
        }

        var property = await _context.Properties
            .Include(p => p.PropertyFacilities)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (property == null)
        {
            return ApiResponse<PropertyDetailDto>.FailureResult("Property not found.");
        }

        property.Name = dto.Name.Trim();
        property.Description = dto.Description.Trim();
        property.Location = dto.Location.Trim();
        property.CategoryId = dto.CategoryId;
        property.Bedrooms = dto.Bedrooms;
        property.Bathrooms = dto.Bathrooms;
        property.MaxGuests = dto.MaxGuests;
        property.WhatsAppNumber = dto.WhatsAppNumber.Trim();
        property.Status = dto.Status;
        property.UpdatedAt = DateTime.UtcNow;

        // Synchronize facilities
        property.PropertyFacilities.Clear();
        if (dto.FacilityIds != null && dto.FacilityIds.Count > 0)
        {
            var validFacilityIds = await _context.Facilities
                .Where(f => dto.FacilityIds.Contains(f.Id))
                .Select(f => f.Id)
                .ToListAsync(ct);

            foreach (var facId in validFacilityIds)
            {
                property.PropertyFacilities.Add(new PropertyFacility
                {
                    PropertyId = property.Id,
                    FacilityId = facId
                });
            }
        }

        await _context.SaveChangesAsync(ct);

        return await GetPropertyByIdAsync(property.Id, ct);
    }

    public async Task<ApiResponse<bool>> DeletePropertyAsync(Guid id, CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (property == null)
        {
            return ApiResponse<bool>.FailureResult("Property not found.");
        }

        // Clean up Cloudinary images if stored
        foreach (var img in property.Images)
        {
            if (!string.IsNullOrEmpty(img.PublicId))
            {
                try
                {
                    await _cloudinaryService.DeleteImageAsync(img.PublicId, ct);
                }
                catch
                {
                    // Ignore image delete failures during property deletion
                }
            }
        }

        _context.Properties.Remove(property);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Property deleted successfully.");
    }

    public async Task<ApiResponse<bool>> UpdatePropertyStatusAsync(Guid id, PropertyStatus status, CancellationToken ct = default)
    {
        var property = await _context.Properties.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (property == null)
        {
            return ApiResponse<bool>.FailureResult("Property not found.");
        }

        property.Status = status;
        property.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, $"Property status updated to {status}.");
    }

    public async Task<ApiResponse<PropertyImageDto>> AddImageAsync(
        Guid propertyId,
        string imageUrl,
        string? publicId,
        bool isPrimary = false,
        CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId, ct);

        if (property == null)
        {
            return ApiResponse<PropertyImageDto>.FailureResult("Property not found.");
        }

        if (isPrimary || property.Images.Count == 0)
        {
            foreach (var img in property.Images)
            {
                img.IsPrimary = false;
            }
            isPrimary = true;
        }

        var maxSortOrder = property.Images.Any() ? property.Images.Max(i => i.SortOrder) + 1 : 0;

        var newImage = new PropertyImage
        {
            Id = Guid.NewGuid(),
            PropertyId = propertyId,
            ImageUrl = imageUrl,
            PublicId = publicId,
            SortOrder = maxSortOrder,
            IsPrimary = isPrimary,
            CreatedAt = DateTime.UtcNow
        };

        await _context.PropertyImages.AddAsync(newImage, ct);
        await _context.SaveChangesAsync(ct);

        return ApiResponse<PropertyImageDto>.SuccessResult(new PropertyImageDto
        {
            Id = newImage.Id,
            PropertyId = newImage.PropertyId,
            ImageUrl = newImage.ImageUrl,
            PublicId = newImage.PublicId,
            SortOrder = newImage.SortOrder,
            IsPrimary = newImage.IsPrimary,
            CreatedAt = newImage.CreatedAt
        }, "Image added successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteImageAsync(Guid propertyId, Guid imageId, CancellationToken ct = default)
    {
        var image = await _context.PropertyImages.FirstOrDefaultAsync(i => i.Id == imageId && i.PropertyId == propertyId, ct);
        if (image == null)
        {
            return ApiResponse<bool>.FailureResult("Image not found.");
        }

        var wasPrimary = image.IsPrimary;

        if (!string.IsNullOrEmpty(image.PublicId))
        {
            await _cloudinaryService.DeleteImageAsync(image.PublicId, ct);
        }

        _context.PropertyImages.Remove(image);
        await _context.SaveChangesAsync(ct);

        if (wasPrimary)
        {
            var nextImage = await _context.PropertyImages
                .Where(i => i.PropertyId == propertyId)
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

    public async Task<ApiResponse<bool>> SetPrimaryImageAsync(Guid propertyId, Guid imageId, CancellationToken ct = default)
    {
        var images = await _context.PropertyImages.Where(i => i.PropertyId == propertyId).ToListAsync(ct);
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

    public async Task<ApiResponse<bool>> ReorderImagesAsync(Guid propertyId, List<Guid> imageIds, CancellationToken ct = default)
    {
        var images = await _context.PropertyImages.Where(i => i.PropertyId == propertyId).ToListAsync(ct);

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

    public async Task<ApiResponse<List<PublicPropertyDto>>> GetPublicPropertiesAsync(
        Guid? categoryId = null,
        string? categorySlug = null,
        CancellationToken ct = default)
    {
        var query = _context.Properties
            .Where(p => p.Status == PropertyStatus.Active)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.PropertyFacilities)
                .ThenInclude(pf => pf.Facility)
            .AsNoTracking();

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            var cleanSlug = categorySlug.Trim().ToLower();
            query = query.Where(p => p.Category != null && p.Category.Slug.ToLower() == cleanSlug);
        }

        var properties = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        var publicDtos = properties.Select(MapToPublicDto).ToList();
        return ApiResponse<List<PublicPropertyDto>>.SuccessResult(publicDtos);
    }

    public async Task<ApiResponse<PublicPropertyDto>> GetPublicPropertyByIdAsync(Guid id, CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Where(p => p.Status == PropertyStatus.Active && p.Id == id)
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.PropertyFacilities)
                .ThenInclude(pf => pf.Facility)
            .AsNoTracking()
            .FirstOrDefaultAsync(ct);

        if (property == null)
        {
            return ApiResponse<PublicPropertyDto>.FailureResult("Property not found or is currently inactive.");
        }

        return ApiResponse<PublicPropertyDto>.SuccessResult(MapToPublicDto(property));
    }

    public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var total = await _context.Properties.CountAsync(ct);
        var active = await _context.Properties.CountAsync(p => p.Status == PropertyStatus.Active, ct);
        var draft = await _context.Properties.CountAsync(p => p.Status == PropertyStatus.Draft, ct);
        var inactive = await _context.Properties.CountAsync(p => p.Status == PropertyStatus.Inactive, ct);

        var recent = await _context.Properties
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.PropertyFacilities)
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new PropertyDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Location = p.Location,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                CategorySlug = p.Category != null ? p.Category.Slug : string.Empty,
                Bedrooms = p.Bedrooms,
                Bathrooms = p.Bathrooms,
                MaxGuests = p.MaxGuests,
                WhatsAppNumber = p.WhatsAppNumber,
                Status = p.Status,
                PrimaryImageUrl = p.Images.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault()
                    ?? p.Images.OrderBy(img => img.SortOrder).Select(img => img.ImageUrl).FirstOrDefault(),
                FacilityCount = p.PropertyFacilities.Count,
                ImageCount = p.Images.Count,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt
            })
            .ToListAsync(ct);

        var stats = new DashboardStatsDto
        {
            TotalProperties = total,
            ActiveProperties = active,
            DraftProperties = draft,
            InactiveProperties = inactive,
            RecentProperties = recent
        };

        return ApiResponse<DashboardStatsDto>.SuccessResult(stats);
    }

    private PublicPropertyDto MapToPublicDto(Property p)
    {
        var whatsappUrl = BuildWhatsAppUrl(p);

        return new PublicPropertyDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Location = p.Location,
            CategoryId = p.CategoryId,
            CategoryName = p.Category != null ? p.Category.Name : string.Empty,
            CategorySlug = p.Category != null ? p.Category.Slug : string.Empty,
            Bedrooms = p.Bedrooms,
            Bathrooms = p.Bathrooms,
            MaxGuests = p.MaxGuests,
            WhatsAppNumber = p.WhatsAppNumber,
            WhatsAppUrl = whatsappUrl,
            Images = p.Images
                .OrderBy(img => img.SortOrder)
                .ThenBy(img => img.CreatedAt)
                .Select(img => new PublicPropertyImageDto
                {
                    Url = img.ImageUrl,
                    IsPrimary = img.IsPrimary,
                    SortOrder = img.SortOrder
                })
                .ToList(),
            Facilities = p.PropertyFacilities
                .Where(pf => pf.Facility != null && pf.Facility.IsActive)
                .Select(pf => pf.Facility.Name)
                .OrderBy(f => f)
                .ToList()
        };
    }

    private string BuildWhatsAppUrl(Property p)
    {
        if (string.IsNullOrWhiteSpace(p.WhatsAppNumber))
            return string.Empty;

        var cleanNumber = Regex.Replace(p.WhatsAppNumber, @"[^\d]", "");
        if (string.IsNullOrWhiteSpace(cleanNumber))
            return string.Empty;

        var productUrl = $"{_publicWebsiteBaseUrl}/properties/{p.Id}";
        var message = $"Hello, I'm interested in booking {p.Name} in Wagamon.\n\nProperty Details: {productUrl}\n\nPlease share availability and rates.";

        return $"https://wa.me/{cleanNumber}?text={Uri.EscapeDataString(message)}";
    }
}
