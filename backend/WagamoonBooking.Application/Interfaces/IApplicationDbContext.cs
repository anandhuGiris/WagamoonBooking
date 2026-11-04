using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Property> Properties { get; }
    DbSet<PropertyImage> PropertyImages { get; }
    DbSet<Facility> Facilities { get; }
    DbSet<PropertyFacility> PropertyFacilities { get; }
    DbSet<StayCategory> StayCategories { get; }
    DbSet<Activity> Activities { get; }
    DbSet<ActivityImage> ActivityImages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
