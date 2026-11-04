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

            // Seed Initial Stay Categories
            var defaultCategories = new (string Name, string Slug, string Description, int Order)[]
            {
                ("Villa", "villa", "Exclusive private villas offering scenic hillside seclusion and luxury amenities.", 1),
                ("Resort", "resort", "Full-service boutique nature resorts with premium hospitality and experiences.", 2),
                ("Cottage", "cottage", "Charming stone and timber cottages surrounded by rolling tea plantations.", 3),
                ("Home Stay", "home-stay", "Authentic high-range hospitality with personalized local guidance and meals.", 4),
                ("Tree House", "tree-house", "Elevated tree houses amidst the forest canopy with sweeping valley views.", 5),
                ("Farm Stay", "farm-stay", "Idyllic rural farm cottages offering peaceful eco-friendly retreats.", 6)
            };

            var existingCategorySlugs = await context.StayCategories.Select(c => c.Slug).ToListAsync();
            var categoriesToAdd = defaultCategories
                .Where(cat => !existingCategorySlugs.Contains(cat.Slug, StringComparer.OrdinalIgnoreCase))
                .Select(cat => new StayCategory
                {
                    Id = Guid.NewGuid(),
                    Name = cat.Name,
                    Slug = cat.Slug,
                    Description = cat.Description,
                    DisplayOrder = cat.Order,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            if (categoriesToAdd.Count > 0)
            {
                await context.StayCategories.AddRangeAsync(categoriesToAdd);
                logger.LogInformation("Seeded {Count} new stay categories", categoriesToAdd.Count);
                await context.SaveChangesAsync();
            }

            var defaultCategory = await context.StayCategories.OrderBy(c => c.DisplayOrder).FirstOrDefaultAsync();

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

            // Seed Sample Properties if empty
            if (!await context.Properties.AnyAsync())
            {
                var wifi = await context.Facilities.FirstAsync(f => f.Name == "WiFi");
                var parking = await context.Facilities.FirstAsync(f => f.Name == "Parking");
                var lakeView = await context.Facilities.FirstAsync(f => f.Name == "Lake View");
                var kitchen = await context.Facilities.FirstAsync(f => f.Name == "Kitchen");
                var mountainView = await context.Facilities.FirstAsync(f => f.Name == "Mountain View");
                var balcony = await context.Facilities.FirstAsync(f => f.Name == "Balcony");
                var ac = await context.Facilities.FirstAsync(f => f.Name == "Air Conditioning");

                var villaCategory = await context.StayCategories.FirstOrDefaultAsync(c => c.Slug == "villa") ?? defaultCategory!;
                var cottageCategory = await context.StayCategories.FirstOrDefaultAsync(c => c.Slug == "cottage") ?? defaultCategory!;

                var prop1 = new Property
                {
                    Id = Guid.NewGuid(),
                    Name = "Lake View Villa",
                    Description = "Scenic luxury villa overlooking the tranquil Wagamoon lake with private garden and panoramic deck.",
                    Location = "Wagamoon Lake Valley",
                    CategoryId = villaCategory.Id,
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
                    CategoryId = cottageCategory.Id,
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
                    CategoryId = villaCategory.Id,
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
                logger.LogInformation("Seeded initial sample properties with images, categories, and facilities");
            }

            // Seed Sample Activities if empty
            if (!await context.Activities.AnyAsync())
            {
                var act1 = new Activity
                {
                    Id = Guid.NewGuid(),
                    Name = "Wagamon Pine Forest Trekking",
                    Slug = "pine-forest-trekking",
                    Description = "Embark on an enchanting walking trail through fragrant high-altitude pine plantations. Discover serene clearings, natural bird songs, and magnificent panoramic views overlooking the rolling Western Ghats valleys.",
                    Location = "Pine Valley, Wagamon",
                    Duration = "2 Hours",
                    Price = 500,
                    WhatsAppNumber = "+919876543210",
                    IsActive = true,
                    DisplayOrder = 1,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                };
                act1.Images.Add(new ActivityImage
                {
                    Id = Guid.NewGuid(),
                    ActivityId = act1.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 1,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                });
                act1.Images.Add(new ActivityImage
                {
                    Id = Guid.NewGuid(),
                    ActivityId = act1.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 2,
                    IsPrimary = false,
                    CreatedAt = DateTime.UtcNow.AddDays(-7)
                });

                var act2 = new Activity
                {
                    Id = Guid.NewGuid(),
                    Name = "Kurisumala Off-Road Jeep Safari",
                    Slug = "off-road-jeep-safari",
                    Description = "Experience a thrilling 4x4 rugged jeep expedition across misty mountain tracks, secluded mountain streams, and steep tea estate trails inaccessible to regular vehicles. Witness breathtaking cliff-edge horizons.",
                    Location = "Kurisumala Ridge, Wagamon",
                    Duration = "3 Hours",
                    Price = 1600,
                    WhatsAppNumber = "+919876543210",
                    IsActive = true,
                    DisplayOrder = 2,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                };
                act2.Images.Add(new ActivityImage
                {
                    Id = Guid.NewGuid(),
                    ActivityId = act2.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 1,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                });

                var act3 = new Activity
                {
                    Id = Guid.NewGuid(),
                    Name = "Wagamon Lake Kayaking & Boating",
                    Slug = "lake-kayaking",
                    Description = "Glide peacefully across the crystal calm waters of Wagamon Lake on single or tandem kayaks. A relaxing water adventure suited for both beginners and experienced paddlers surrounded by green hills.",
                    Location = "Wagamon Lake",
                    Duration = "1 Hour",
                    Price = 450,
                    WhatsAppNumber = "+919876543210",
                    IsActive = true,
                    DisplayOrder = 3,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                };
                act3.Images.Add(new ActivityImage
                {
                    Id = Guid.NewGuid(),
                    ActivityId = act3.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
                    SortOrder = 1,
                    IsPrimary = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                });

                await context.Activities.AddRangeAsync(act1, act2, act3);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded initial sample adventure activities");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
