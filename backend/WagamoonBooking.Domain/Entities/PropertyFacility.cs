namespace WagamoonBooking.Domain.Entities;

public class PropertyFacility
{
    public Guid PropertyId { get; set; }
    public Property Property { get; set; } = null!;

    public Guid FacilityId { get; set; }
    public Facility Facility { get; set; } = null!;
}
