using Microsoft.EntityFrameworkCore;
using Moq;
using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Application.Services;
using WagamoonBooking.Application.Validators;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Tests.TestHelpers;
using Xunit;

namespace WagamoonBooking.Tests.Services;

public class ActivityServiceTests : IDisposable
{
    private readonly Application.Interfaces.IApplicationDbContext _context;
    private readonly IDisposable _connection;
    private readonly Mock<ICloudinaryService> _cloudinaryMock;
    private readonly ActivityService _activityService;

    public ActivityServiceTests()
    {
        var (context, connection) = TestDbContextFactory.CreateInMemoryDbContext();
        _context = context;
        _connection = connection;
        _cloudinaryMock = new Mock<ICloudinaryService>();

        _activityService = new ActivityService(
            _context,
            _cloudinaryMock.Object,
            new CreateActivityDtoValidator(),
            new UpdateActivityDtoValidator());
    }

    [Fact]
    public async Task CreateActivityAsync_ValidData_CreatesActivitySuccessfully()
    {
        // Arrange
        var dto = new CreateActivityDto
        {
            Name = "Pine Forest Trekking",
            Description = "A scenic walk through mist-covered high pines.",
            Location = "Pine Valley, Wagamon",
            Duration = "2 Hours",
            Price = 500,
            WhatsAppNumber = "+919876543210",
            IsActive = true,
            DisplayOrder = 1
        };

        // Act
        var result = await _activityService.CreateActivityAsync(dto);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Pine Forest Trekking", result.Data.Name);
        Assert.Equal("pine-forest-trekking", result.Data.Slug);
        Assert.Equal(500, result.Data.Price);
    }

    [Fact]
    public async Task AddImageAsync_FirstImage_IsAutomaticallyPrimary()
    {
        // Arrange
        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            Name = "Jeep Safari",
            Slug = "jeep-safari",
            Description = "Thrilling 4x4 rugged trail.",
            Location = "Kurisumala",
            IsActive = true
        };
        await _context.Activities.AddAsync(activity);
        await _context.SaveChangesAsync();
        ((DbContext)_context).ChangeTracker.Clear();

        // Act
        var result = await _activityService.AddImageAsync(activity.Id, "https://example.com/act1.jpg", "pub_act_1", isPrimary: false);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.IsPrimary);
    }

    [Fact]
    public async Task GetPublicActivitiesAsync_ReturnsOnlyActiveActivities_WithWhatsAppUrl()
    {
        // Arrange
        var activeAct = new Activity
        {
            Id = Guid.NewGuid(),
            Name = "Kayaking Lake Adventure",
            Slug = "kayaking-lake-adventure",
            Description = "Kayaking on Wagamon lake.",
            Location = "Wagamon Lake",
            WhatsAppNumber = "+919876543210",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        var inactiveAct = new Activity
        {
            Id = Guid.NewGuid(),
            Name = "Hidden Inactive Activity",
            Slug = "hidden-inactive-activity",
            Description = "Not yet available for public booking.",
            Location = "Wagamon",
            IsActive = false,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Activities.AddRangeAsync(activeAct, inactiveAct);
        await _context.SaveChangesAsync();

        // Act
        var result = await _activityService.GetPublicActivitiesAsync();

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Single(result.Data);
        Assert.Equal("Kayaking Lake Adventure", result.Data[0].Name);
        Assert.Contains("919876543210", result.Data[0].WhatsAppUrl);
    }

    [Fact]
    public async Task DeleteActivityAsync_RemovesEntityAndDeletesImagesFromCloudinary()
    {
        // Arrange
        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            Name = "Zipline Ride",
            Slug = "zipline-ride",
            Description = "High speed canopy zipline.",
            Location = "Adventure Park",
            IsActive = true
        };
        activity.Images.Add(new ActivityImage
        {
            Id = Guid.NewGuid(),
            ActivityId = activity.Id,
            ImageUrl = "https://example.com/zipline.jpg",
            PublicId = "cloudinary_zip_1"
        });

        await _context.Activities.AddAsync(activity);
        await _context.SaveChangesAsync();

        _cloudinaryMock
            .Setup(c => c.DeleteImageAsync("cloudinary_zip_1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _activityService.DeleteActivityAsync(activity.Id);

        // Assert
        Assert.True(result.Success);
        Assert.Null(await _context.Activities.FindAsync(activity.Id));
        _cloudinaryMock.Verify(c => c.DeleteImageAsync("cloudinary_zip_1", It.IsAny<CancellationToken>()), Times.Once);
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}

