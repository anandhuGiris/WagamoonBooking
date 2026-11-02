using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Domain.Enums;

namespace WagamoonBooking.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger logger)
    {
        try
        {
            // Seed Admin User
            var adminEmail = configuration["SeedData:AdminEmail"] ?? "admin@example.com";
            var adminPassword = configuration["AdminSeed:Password"] 
                ?? configuration["SeedData:AdminPassword"] 
                ?? "Admin@12345";

            var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == adminEmail.ToLower());
            if (existingAdmin == null)
            {
                var admin = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Administrator",
                    Email = adminEmail.ToLower(),
                    PasswordHash = passwordHasher.HashPassword(adminPassword),
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(admin);
                logger.LogInformation("Seeded default admin user: {Email}", adminEmail);
            }

            // Seed Initial Facilities
            var defaultFacilities = new[]
            {
                "WiFi",
                "Parking",
                "Kitchen",
                "Air Conditioning",
                "TV",
                "Swimming Pool",
                "Balcony",
                "Lake View",
                "Mountain View"
            };

            var existingFacilityNames = await context.Facilities.Select(f => f.Name).ToListAsync();
            var facilitiesToAdd = defaultFacilities
                .Where(name => !existingFacilityNames.Contains(name, StringComparer.OrdinalIgnoreCase))
                .Select(name => new Facility
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            if (facilitiesToAdd.Count > 0)
            {
                await context.Facilities.AddRangeAsync(facilitiesToAdd);
                logger.LogInformation("Seeded {Count} new facilities", facilitiesToAdd.Count);
            }

            await context.SaveChangesAsync();

            // Seed Sample Properties if empty (so local dev has realistic data immediately)
            if (!await context.Properties.AnyAsync())
            {
                var wifi = await context.Facilities.FirstAsync(f => f.Name == "WiFi");
                var parking = await context.Facilities.FirstAsync(f => f.Name == "Parking");
                var lakeView = await context.Facilities.FirstAsync(f => f.Name == "Lake View");
                var kitchen = await context.Facilities.FirstAsync(f => f.Name == "Kitchen");
                var mountainView = await context.Facilities.FirstAsync(f => f.Name == "Mountain View");
                var balcony = await context.Facilities.FirstAsync(f => f.Name == "Balcony");
                var ac = await context.Facilities.FirstAsync(f => f.Name == "Air Conditioning");

                var prop1 = new Property
                {
                    Id = Guid.NewGuid(),
                    Name = "Lake View Villa",
                    Description = "Scenic luxury villa overlooking the tranquil Wagamoon lake with private garden and panoramic deck.",
                    Location = "Wagamoon Lake Valley",
                    Bedrooms = 3,
                    Bathrooms = 2,
                    MaxGuests = 8,
                    WhatsAppNumber = "+919876543210",
                    Status = PropertyStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                };
                prop1.Images.Add(new PropertyImage
                {
                    Id = Guid.NewGuid(),
                    PropertyId = prop1.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 1,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });
                prop1.Images.Add(new PropertyImage
                {
                    Id = Guid.NewGuid(),
                    PropertyId = prop1.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 2,
                    IsPrimary = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                });
                prop1.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop1.Id, FacilityId = wifi.Id });
                prop1.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop1.Id, FacilityId = parking.Id });
                prop1.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop1.Id, FacilityId = lakeView.Id });
                prop1.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop1.Id, FacilityId = kitchen.Id });

                var prop2 = new Property
                {
                    Id = Guid.NewGuid(),
                    Name = "Misty Mountain Cottage",
                    Description = "Cozy stone cottage nestled among pine trees with mesmerizing hill views and private bonfire space.",
                    Location = "Pine Valley, Wagamoon",
                    Bedrooms = 2,
                    Bathrooms = 2,
                    MaxGuests = 5,
                    WhatsAppNumber = "+919876543210",
                    Status = PropertyStatus.Active,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                };
                prop2.Images.Add(new PropertyImage
                {
                    Id = Guid.NewGuid(),
                    PropertyId = prop2.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 1,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                });
                prop2.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop2.Id, FacilityId = wifi.Id });
                prop2.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop2.Id, FacilityId = mountainView.Id });
                prop2.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop2.Id, FacilityId = balcony.Id });

                var prop3 = new Property
                {
                    Id = Guid.NewGuid(),
                    Name = "Pine Forest Chalet",
                    Description = "Spacious modern timber chalet currently undergoing aesthetic upgrades. Ideal for large family retreats.",
                    Location = "Upper Meadow, Wagamoon",
                    Bedrooms = 4,
                    Bathrooms = 3,
                    MaxGuests = 10,
                    WhatsAppNumber = "+919876543210",
                    Status = PropertyStatus.Draft,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                };
                prop3.Images.Add(new PropertyImage
                {
                    Id = Guid.NewGuid(),
                    PropertyId = prop3.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 1,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                });
                prop3.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop3.Id, FacilityId = wifi.Id });
                prop3.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop3.Id, FacilityId = parking.Id });
                prop3.PropertyFacilities.Add(new PropertyFacility { PropertyId = prop3.Id, FacilityId = ac.Id });

                await context.Properties.AddRangeAsync(prop1, prop2, prop3);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded initial sample properties with images and facilities");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
