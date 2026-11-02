using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data.Configurations;

public class PropertyImageConfiguration : IEntityTypeConfiguration<PropertyImage>
{
    public void Configure(EntityTypeBuilder<PropertyImage> builder)
    {
        builder.ToTable("PropertyImages");

        builder.HasKey(img => img.Id);

        builder.Property(img => img.ImageUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(img => img.PublicId)
            .HasMaxLength(250);

        builder.HasIndex(img => new { img.PropertyId, img.SortOrder });
    }
}
