using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data.Configurations;

public class PropertyFacilityConfiguration : IEntityTypeConfiguration<PropertyFacility>
{
    public void Configure(EntityTypeBuilder<PropertyFacility> builder)
    {
        builder.ToTable("PropertyFacilities");

        builder.HasKey(pf => new { pf.PropertyId, pf.FacilityId });

        builder.HasOne(pf => pf.Property)
            .WithMany(p => p.PropertyFacilities)
            .HasForeignKey(pf => pf.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(pf => pf.Facility)
            .WithMany(f => f.PropertyFacilities)
            .HasForeignKey(pf => pf.FacilityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
