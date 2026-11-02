namespace WagamoonBooking.Application.DTOs.PropertyImages;

public class PropertyImageDto
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReorderImagesDto
{
    public List<Guid> ImageIds { get; set; } = new();
}

public class ImageUploadResultDto
{
    public string Url { get; set; } = string.Empty;
    public string? PublicId { get; set; }
}
