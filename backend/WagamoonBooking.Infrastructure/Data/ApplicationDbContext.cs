using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<PropertyFacility> PropertyFacilities => Set<PropertyFacility>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
