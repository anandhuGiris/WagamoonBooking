namespace WagamoonBooking.Application.DTOs.Activities;

public class ActivityDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public decimal? Price { get; set; }
    public string? WhatsAppNumber { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public int ImageCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ActivityDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public decimal? Price { get; set; }
    public string? WhatsAppNumber { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<ActivityImageDto> Images { get; set; } = new();
}

public class CreateActivityDto
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public decimal? Price { get; set; }
    public string? WhatsAppNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; } = 0;
}

public class UpdateActivityDto
{
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public decimal? Price { get; set; }
    public string? WhatsAppNumber { get; set; }
    public bool IsActive { get; set; }
    public int DisplayOrder { get; set; } = 0;
}

public class ActivityImageDto
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReorderActivityImagesDto
{
    public List<Guid> ImageIds { get; set; } = new();
}

public class PublicActivityDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public decimal? Price { get; set; }
    public string? WhatsAppNumber { get; set; }
    public string WhatsAppUrl { get; set; } = string.Empty;
    public List<PublicActivityImageDto> Images { get; set; } = new();
}

public class PublicActivityImageDto
{
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

