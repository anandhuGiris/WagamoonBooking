using WagamoonBooking.Application.DTOs.Properties;

namespace WagamoonBooking.Application.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalProperties { get; set; }
    public int ActiveProperties { get; set; }
    public int DraftProperties { get; set; }
    public int InactiveProperties { get; set; }
    public List<PropertyDto> RecentProperties { get; set; } = new();
}
