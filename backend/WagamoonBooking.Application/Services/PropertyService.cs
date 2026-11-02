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

    public PropertyService(
        IApplicationDbContext context,
        ICloudinaryService cloudinaryService,
        IValidator<CreatePropertyDto> createValidator,
        IValidator<UpdatePropertyDto> updateValidator)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    public async Task<ApiResponse<PagedResult<PropertyDto>>> GetPropertiesAsync(
        int page,
        int pageSize,
        string? search,
        PropertyStatus? status,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Properties
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

        var property = new Property
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Location = dto.Location.Trim(),
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

        // Delete associated Cloudinary images
        foreach (var img in property.Images)
        {
            if (!string.IsNullOrWhiteSpace(img.PublicId))
            {
                try
                {
                    await _cloudinaryService.DeleteImageAsync(img.PublicId, ct);
                }
                catch
                {
                    // Log and continue deletion of database entities
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
        bool isPrimary,
        CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId, ct);

        if (property == null)
        {
            return ApiResponse<PropertyImageDto>.FailureResult("Property not found.");
        }

        var maxSortOrder = property.Images.Any() ? property.Images.Max(img => img.SortOrder) : 0;
        var hasPrimary = property.Images.Any(img => img.IsPrimary);

        if (isPrimary && hasPrimary)
        {
            foreach (var img in property.Images)
            {
                img.IsPrimary = false;
            }
        }
        else if (!hasPrimary)
        {
            isPrimary = true;
        }

        var newImage = new PropertyImage
        {
            Id = Guid.NewGuid(),
            PropertyId = propertyId,
            ImageUrl = imageUrl,
            PublicId = publicId,
            SortOrder = maxSortOrder + 1,
            IsPrimary = isPrimary,
            CreatedAt = DateTime.UtcNow
        };

        await _context.PropertyImages.AddAsync(newImage, ct);
        property.UpdatedAt = DateTime.UtcNow;

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
        }, "Image uploaded successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteImageAsync(Guid propertyId, Guid imageId, CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId, ct);

        if (property == null)
        {
            return ApiResponse<bool>.FailureResult("Property not found.");
        }

        var image = property.Images.FirstOrDefault(img => img.Id == imageId);
        if (image == null)
        {
            return ApiResponse<bool>.FailureResult("Image not found.");
        }

        var wasPrimary = image.IsPrimary;

        if (!string.IsNullOrWhiteSpace(image.PublicId))
        {
            try
            {
                await _cloudinaryService.DeleteImageAsync(image.PublicId, ct);
            }
            catch
            {
                // Continue removing DB record
            }
        }

        property.Images.Remove(image);

        if (wasPrimary && property.Images.Any())
        {
            var firstRemaining = property.Images.OrderBy(img => img.SortOrder).First();
            firstRemaining.IsPrimary = true;
        }

        property.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Image deleted successfully.");
    }

    public async Task<ApiResponse<bool>> SetPrimaryImageAsync(Guid propertyId, Guid imageId, CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId, ct);

        if (property == null)
        {
            return ApiResponse<bool>.FailureResult("Property not found.");
        }

        var targetImage = property.Images.FirstOrDefault(img => img.Id == imageId);
        if (targetImage == null)
        {
            return ApiResponse<bool>.FailureResult("Image not found.");
        }

        foreach (var img in property.Images)
        {
            img.IsPrimary = (img.Id == imageId);
        }

        property.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Primary image updated.");
    }

    public async Task<ApiResponse<bool>> ReorderImagesAsync(Guid propertyId, List<Guid> imageIds, CancellationToken ct = default)
    {
        var property = await _context.Properties
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == propertyId, ct);

        if (property == null)
        {
            return ApiResponse<bool>.FailureResult("Property not found.");
        }

        for (int i = 0; i < imageIds.Count; i++)
        {
            var img = property.Images.FirstOrDefault(m => m.Id == imageIds[i]);
            if (img != null)
            {
                img.SortOrder = i + 1;
            }
        }

        property.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(ct);

        return ApiResponse<bool>.SuccessResult(true, "Images reordered successfully.");
    }

    public async Task<ApiResponse<List<PublicPropertyDto>>> GetPublicPropertiesAsync(CancellationToken ct = default)
    {
        // Public API must ONLY expose Active properties!
        var properties = await _context.Properties
            .Where(p => p.Status == PropertyStatus.Active)
            .Include(p => p.Images)
            .Include(p => p.PropertyFacilities)
                .ThenInclude(pf => pf.Facility)
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        var publicDtos = properties.Select(MapToPublicDto).ToList();
        return ApiResponse<List<PublicPropertyDto>>.SuccessResult(publicDtos);
    }

    public async Task<ApiResponse<PublicPropertyDto>> GetPublicPropertyByIdAsync(Guid id, CancellationToken ct = default)
    {
        // Public API must ONLY expose Active property!
        var property = await _context.Properties
            .Where(p => p.Status == PropertyStatus.Active && p.Id == id)
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

    private static PublicPropertyDto MapToPublicDto(Property p)
    {
        var cleanNumber = Regex.Replace(p.WhatsAppNumber, @"[^\d]", "");
        var message = Uri.EscapeDataString($"Hi, I'm interested in {p.Name}.");
        var whatsappUrl = $"https://wa.me/{cleanNumber}?text={message}";

        return new PublicPropertyDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Location = p.Location,
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
}
