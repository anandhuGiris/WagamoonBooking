namespace WagamoonBooking.Application.DTOs.Facilities;

public class FacilityDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateFacilityDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateFacilityDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
