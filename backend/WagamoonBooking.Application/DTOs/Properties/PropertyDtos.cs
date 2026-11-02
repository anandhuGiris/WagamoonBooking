using WagamoonBooking.Application.DTOs.Facilities;
using WagamoonBooking.Application.DTOs.PropertyImages;
using WagamoonBooking.Domain.Enums;

namespace WagamoonBooking.Application.DTOs.Properties;

public class PropertyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? MaxGuests { get; set; }
    public string WhatsAppNumber { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public int FacilityCount { get; set; }
    public int ImageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class PropertyDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? MaxGuests { get; set; }
    public string WhatsAppNumber { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<PropertyImageDto> Images { get; set; } = new();
    public List<FacilityDto> Facilities { get; set; } = new();
    public List<Guid> FacilityIds { get; set; } = new();
}

public class CreatePropertyDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? MaxGuests { get; set; }
    public string WhatsAppNumber { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; } = PropertyStatus.Draft;
    public List<Guid> FacilityIds { get; set; } = new();
}

public class UpdatePropertyDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? MaxGuests { get; set; }
    public string WhatsAppNumber { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; }
    public List<Guid> FacilityIds { get; set; } = new();
}

public class UpdatePropertyStatusDto
{
    public PropertyStatus Status { get; set; }
}

public class PublicPropertyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? MaxGuests { get; set; }
    public List<PublicPropertyImageDto> Images { get; set; } = new();
    public List<string> Facilities { get; set; } = new();
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string WhatsAppUrl { get; set; } = string.Empty;
}

public class PublicPropertyImageDto
{
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}
