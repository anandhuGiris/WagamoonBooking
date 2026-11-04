using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Application.DTOs.StayCategories;
using WagamoonBooking.Application.Services;
using WagamoonBooking.Application.Validators;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Domain.Enums;
using WagamoonBooking.Tests.TestHelpers;
using Xunit;

namespace WagamoonBooking.Tests.Services;

public class StayCategoryServiceTests : IDisposable
{
    private readonly Application.Interfaces.IApplicationDbContext _context;
    private readonly IDisposable _connection;
    private readonly StayCategoryService _categoryService;

    public StayCategoryServiceTests()
    {
        var (context, connection) = TestDbContextFactory.CreateInMemoryDbContext();
        _context = context;
        _connection = connection;

        _categoryService = new StayCategoryService(
            _context,
            new CreateStayCategoryDtoValidator(),
            new UpdateStayCategoryDtoValidator());
    }

    [Fact]
    public async Task CreateCategoryAsync_ValidData_CreatesCategoryWithAutoSlug()
    {
        // Arrange
        var dto = new CreateStayCategoryDto
        {
            Name = "Luxury Tree House",
            Description = "Elevated scenic wooden stays in the canopy.",
            IsActive = true,
            DisplayOrder = 1
        };

        // Act
        var result = await _categoryService.CreateCategoryAsync(dto);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("Luxury Tree House", result.Data.Name);
        Assert.Equal("luxury-tree-house", result.Data.Slug);
        Assert.True(result.Data.IsActive);
    }

    [Fact]
    public async Task CreateCategoryAsync_DuplicateName_ReturnsFailure()
    {
        // Arrange
        var existing = new StayCategory
        {
            Id = Guid.NewGuid(),
            Name = "Villa",
            Slug = "villa",
            IsActive = true
        };
        await _context.StayCategories.AddAsync(existing);
        await _context.SaveChangesAsync();

        var dto = new CreateStayCategoryDto { Name = "Villa" };

        // Act
        var result = await _categoryService.CreateCategoryAsync(dto);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("already exists", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task DeleteCategoryAsync_WithAssignedProperties_FailsAndProtectsData()
    {
        // Arrange
        var category = new StayCategory
        {
            Id = Guid.NewGuid(),
            Name = "Protected Category",
            Slug = "protected-category",
            IsActive = true
        };
        await _context.StayCategories.AddAsync(category);

        var property = new Property
        {
            Id = Guid.NewGuid(),
            Name = "Assigned Property",
            Description = "Property assigned to the category.",
            Location = "Wagamon",
            CategoryId = category.Id,
            WhatsAppNumber = "+919876543210",
            Status = PropertyStatus.Active
        };
        await _context.Properties.AddAsync(property);
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.DeleteCategoryAsync(category.Id);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("assigned", result.Message, StringComparison.OrdinalIgnoreCase);
        // Verify category is still in database
        Assert.NotNull(await _context.StayCategories.FindAsync(category.Id));
    }

    [Fact]
    public async Task DeleteCategoryAsync_NoAssignedProperties_Succeeds()
    {
        // Arrange
        var category = new StayCategory
        {
            Id = Guid.NewGuid(),
            Name = "Empty Category",
            Slug = "empty-category",
            IsActive = true
        };
        await _context.StayCategories.AddAsync(category);
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.DeleteCategoryAsync(category.Id);

        // Assert
        Assert.True(result.Success);
        Assert.Null(await _context.StayCategories.FindAsync(category.Id));
    }

    [Fact]
    public async Task ToggleStatusAsync_InvertsIsActiveFlag()
    {
        // Arrange
        var category = new StayCategory
        {
            Id = Guid.NewGuid(),
            Name = "Toggle Test",
            Slug = "toggle-test",
            IsActive = true
        };
        await _context.StayCategories.AddAsync(category);
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.ToggleStatusAsync(category.Id);

        // Assert
        Assert.True(result.Success);
        Assert.False(result.Data!.IsActive);

        var refreshed = await _context.StayCategories.FindAsync(category.Id);
        Assert.False(refreshed!.IsActive);
    }

    [Fact]
    public async Task GetPublicCategoriesAsync_ReturnsOnlyActiveCategories()
    {
        // Arrange
        var active1 = new StayCategory { Id = Guid.NewGuid(), Name = "Active A", Slug = "active-a", IsActive = true, DisplayOrder = 2 };
        var active2 = new StayCategory { Id = Guid.NewGuid(), Name = "Active B", Slug = "active-b", IsActive = true, DisplayOrder = 1 };
        var inactive = new StayCategory { Id = Guid.NewGuid(), Name = "Inactive C", Slug = "inactive-c", IsActive = false, DisplayOrder = 3 };

        await _context.StayCategories.AddRangeAsync(active1, active2, inactive);
        await _context.SaveChangesAsync();

        // Act
        var result = await _categoryService.GetPublicCategoriesAsync();

        // Assert
        Assert.True(result.Success);
        Assert.Equal(2, result.Data!.Count);
        Assert.Equal("Active B", result.Data[0].Name); // DisplayOrder 1 comes first
        Assert.Equal("Active A", result.Data[1].Name);
        Assert.DoesNotContain(result.Data, c => c.Name == "Inactive C");
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}

