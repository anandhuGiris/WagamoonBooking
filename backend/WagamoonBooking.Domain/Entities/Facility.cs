namespace WagamoonBooking.Domain.Entities;

public class Facility
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<PropertyFacility> PropertyFacilities { get; set; } = new List<PropertyFacility>();
}
