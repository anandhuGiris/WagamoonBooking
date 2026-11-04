using WagamoonBooking.Domain.Enums;

namespace WagamoonBooking.Domain.Entities;

public class Property
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int? Bedrooms { get; set; }
    public int? Bathrooms { get; set; }
    public int? MaxGuests { get; set; }
    public string WhatsAppNumber { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; } = PropertyStatus.Draft;
    public Guid CategoryId { get; set; }
    public StayCategory? Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
    public ICollection<PropertyFacility> PropertyFacilities { get; set; } = new List<PropertyFacility>();
}
