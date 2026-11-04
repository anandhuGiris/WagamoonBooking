using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data.Configurations;

public class ActivityImageConfiguration : IEntityTypeConfiguration<ActivityImage>
{
    public void Configure(EntityTypeBuilder<ActivityImage> builder)
    {
        builder.ToTable("ActivityImages");

        builder.HasKey(img => img.Id);

        builder.Property(img => img.ImageUrl)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(img => img.PublicId)
            .HasMaxLength(250);

        builder.HasIndex(img => new { img.ActivityId, img.SortOrder });
    }
}
