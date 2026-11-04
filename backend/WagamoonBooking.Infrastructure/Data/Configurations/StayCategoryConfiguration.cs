using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data.Configurations;

public class StayCategoryConfiguration : IEntityTypeConfiguration<StayCategory>
{
    public void Configure(EntityTypeBuilder<StayCategory> builder)
    {
        builder.ToTable("StayCategories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Slug)
            .IsRequired()
            .HasMaxLength(120);

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(c => c.DisplayOrder)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasIndex(c => c.Name).IsUnique();
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.HasIndex(c => c.IsActive);
        builder.HasIndex(c => c.DisplayOrder);

        builder.HasMany(c => c.Properties)
            .WithOne(p => p.Category)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
