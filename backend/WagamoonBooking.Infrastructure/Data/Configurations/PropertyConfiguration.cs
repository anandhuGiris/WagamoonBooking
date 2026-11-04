using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Infrastructure.Data.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("Properties");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Description)
            .IsRequired();

        builder.Property(p => p.Location)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.WhatsAppNumber)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.Location);
        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.CreatedAt);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Properties)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Images)
            .WithOne(img => img.Property)
            .HasForeignKey(img => img.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PropertyFacilities)
            .WithOne(pf => pf.Property)
            .HasForeignKey(pf => pf.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
