using Microsoft.EntityFrameworkCore;
using Moq;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Application.Services;
using WagamoonBooking.Application.Validators;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Domain.Enums;
using WagamoonBooking.Tests.TestHelpers;
using Xunit;

namespace WagamoonBooking.Tests.Services;

public class PropertyServiceTests : IDisposable
{
    private readonly Application.Interfaces.IApplicationDbContext _context;
    private readonly IDisposable _connection;
    private readonly Mock<ICloudinaryService> _cloudinaryMock;
    private readonly PropertyService _propertyService;

    public PropertyServiceTests()
    {
        var (context, connection) = TestDbContextFactory.CreateInMemoryDbContext();
        _context = context;
        _connection = connection;
        _cloudinaryMock = new Mock<ICloudinaryService>();

        _propertyService = new PropertyService(
            _context,
            _cloudinaryMock.Object,
            new CreatePropertyDtoValidator(),
            new UpdatePropertyDtoValidator());
    }

    [Fact]
    public async Task CreatePropertyAsync_ValidData_CreatesPropertyWithFacilities()
    {
        // Arrange
        var facility = new Facility { Id = Guid.NewGuid(), Name = "WiFi", IsActive = true };
        await _context.Facilities.AddAsync(facility);
        await _context.SaveChangesAsync();

        var dto = new CreatePropertyDto
        {
            Name = "Mountain View Villa",
            Description = "A wonderful villa in the hills of Wagamoon with scenic vistas.",
            Location = "Wagamoon Hills",
            Bedrooms = 3,
            Bathrooms = 2,
            MaxGuests = 6,
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Draft,
            FacilityIds = new List<Guid> { facility.Id }
        };

        // Act
        var result = await _propertyService.CreatePropertyAsync(dto);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Mountain View Villa", result.Data.Name);
        Assert.Equal(PropertyStatus.Draft, result.Data.Status);
        Assert.Single(result.Data.Facilities);
        Assert.Equal("WiFi", result.Data.Facilities[0].Name);
    }

    [Fact]
    public async Task CreatePropertyAsync_InvalidWhatsApp_ReturnsValidationError()
    {
        // Arrange
        var dto = new CreatePropertyDto
        {
            Name = "Invalid Property",
            Description = "Short description with sufficient length for valid input test.",
            Location = "Location",
            WhatsAppNumber = "invalid-phone",
            Status = PropertyStatus.Draft
        };

        // Act
        var result = await _propertyService.CreatePropertyAsync(dto);

        // Assert
        Assert.False(result.Success);
        Assert.NotNull(result.Errors);
        Assert.Contains(result.Errors, e => e.Field.Equals("WhatsAppNumber", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task GetPublicPropertiesAsync_ReturnsOnlyActiveProperties_ExcludesDraftAndInactive()
    {
        // Arrange
        var activeProperty = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Active Resort",
            Description = "A publicly visible resort in Wagamoon.",
            Location = "Lake Road",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        var draftProperty = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Draft Hidden Property",
            Description = "Should not be visible to the public.",
            Location = "Secret Road",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };
        var inactiveProperty = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Inactive Archived Property",
            Description = "Should not be visible to the public.",
            Location = "Old Road",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Inactive,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Properties.AddRangeAsync(activeProperty, draftProperty, inactiveProperty);
        await _context.SaveChangesAsync();

        // Act
        var result = await _propertyService.GetPublicPropertiesAsync();

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data);
        Assert.Equal("Active Resort", result.Data[0].Name);
        Assert.Contains("919876543210", result.Data[0].WhatsAppUrl);
        Assert.Contains("Active%20Resort", result.Data[0].WhatsAppUrl);
    }

    [Fact]
    public async Task UpdatePropertyStatusAsync_ChangesStatusCorrectly()
    {
        // Arrange
        var prop = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Status Test Property",
            Description = "Testing status changes between draft, active, and inactive.",
            Location = "Valley",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Draft
        };
        await _context.Properties.AddAsync(prop);
        await _context.SaveChangesAsync();

        // Act
        var result = await _propertyService.UpdatePropertyStatusAsync(prop.Id, PropertyStatus.Active);
        var updated = await _context.Properties.FindAsync(prop.Id);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(updated);
        Assert.Equal(PropertyStatus.Active, updated.Status);
    }

    [Fact]
    public async Task AddImageAsync_FirstImage_IsAutomaticallySetAsPrimary()
    {
        // Arrange
        var prop = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Image Test Property",
            Description = "Testing automatic primary image assignment.",
            Location = "Valley",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Draft
        };
        await _context.Properties.AddAsync(prop);
        await _context.SaveChangesAsync();
        ((DbContext)_context).ChangeTracker.Clear();

        // Act
        var result = await _propertyService.AddImageAsync(prop.Id, "https://example.com/img1.jpg", "pub1", isPrimary: false);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.IsPrimary);
    }

    [Fact]
    public async Task SetPrimaryImageAsync_SwitchesPrimaryFlagCorrectly()
    {
        // Arrange
        var prop = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Primary Image Switch",
            Description = "Testing primary flag switching between multiple images.",
            Location = "Valley",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Draft
        };
        var img1 = new PropertyImage { Id = Guid.NewGuid(), PropertyId = prop.Id, ImageUrl = "https://example.com/1.jpg", IsPrimary = true, SortOrder = 1 };
        var img2 = new PropertyImage { Id = Guid.NewGuid(), PropertyId = prop.Id, ImageUrl = "https://example.com/2.jpg", IsPrimary = false, SortOrder = 2 };
        prop.Images.Add(img1);
        prop.Images.Add(img2);
        await _context.Properties.AddAsync(prop);
        await _context.SaveChangesAsync();

        // Act
        var result = await _propertyService.SetPrimaryImageAsync(prop.Id, img2.Id);

        // Assert
        Assert.True(result.Success);
        Assert.False(img1.IsPrimary);
        Assert.True(img2.IsPrimary);
    }

    [Fact]
    public async Task DeletePropertyAsync_DeletesPropertyAndCallsCloudinary()
    {
        // Arrange
        var prop = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Delete Test",
            Description = "Testing deletion cascade and Cloudinary cleanup.",
            Location = "Valley",
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Draft
        };
        prop.Images.Add(new PropertyImage
        {
            Id = Guid.NewGuid(),
            PropertyId = prop.Id,
            ImageUrl = "https://example.com/cloud.jpg",
            PublicId = "cloudinary_id_123"
        });
        await _context.Properties.AddAsync(prop);
        await _context.SaveChangesAsync();

        _cloudinaryMock
            .Setup(c => c.DeleteImageAsync("cloudinary_id_123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _propertyService.DeletePropertyAsync(prop.Id);

        // Assert
        Assert.True(result.Success);
        Assert.Null(await _context.Properties.FindAsync(prop.Id));
        _cloudinaryMock.Verify(c => c.DeleteImageAsync("cloudinary_id_123", It.IsAny<CancellationToken>()), Times.Once);
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}
