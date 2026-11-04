namespace WagamoonBooking.Domain.Entities;

public class ActivityImage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ActivityId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Activity Activity { get; set; } = null!;
}

