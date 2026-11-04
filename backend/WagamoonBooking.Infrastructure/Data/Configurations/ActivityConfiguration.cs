using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Slug)
            .IsRequired()
            .HasMaxLength(220);

        builder.Property(a => a.Description)
            .IsRequired();

        builder.Property(a => a.Location)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Duration)
            .HasMaxLength(100);

        builder.Property(a => a.Price)
            .HasColumnType("decimal(18,2)");

        builder.Property(a => a.WhatsAppNumber)
            .HasMaxLength(30);

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(a => a.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(a => a.Name);
        builder.HasIndex(a => a.Slug).IsUnique();
        builder.HasIndex(a => a.IsActive);
        builder.HasIndex(a => a.DisplayOrder);
        builder.HasIndex(a => a.CreatedAt);

        builder.HasMany(a => a.Images)
            .WithOne(img => img.Activity)
            .HasForeignKey(img => img.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
