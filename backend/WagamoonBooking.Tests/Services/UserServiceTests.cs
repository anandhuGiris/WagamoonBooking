using Moq;
using WagamoonBooking.Application.DTOs.Users;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Application.Services;
using WagamoonBooking.Application.Validators;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Tests.TestHelpers;
using Xunit;

namespace WagamoonBooking.Tests.Services;

public class UserServiceTests : IDisposable
{
    private readonly IApplicationDbContext _context;
    private readonly IDisposable _connection;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        var (context, connection) = TestDbContextFactory.CreateInMemoryDbContext();
        _context = context;
        _connection = connection;
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _passwordHasherMock
            .Setup(h => h.HashPassword(It.IsAny<string>()))
            .Returns("hashed_password_123");

        _userService = new UserService(
            _context,
            _passwordHasherMock.Object,
            new CreateAdminDtoValidator(),
            new UpdateAdminDtoValidator());
    }

    [Fact]
    public async Task GetAdminsAsync_ReturnsAllAdmins()
    {
        // Arrange
        var user1 = new User { Id = Guid.NewGuid(), Name = "Admin 1", Email = "admin1@test.com", Role = "Admin", IsActive = true };
        var user2 = new User { Id = Guid.NewGuid(), Name = "Admin 2", Email = "admin2@test.com", Role = "Admin", IsActive = true };
        await _context.Users.AddRangeAsync(user1, user2);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.GetAdminsAsync();

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.True(result.Data.Count >= 2);
    }

    [Fact]
    public async Task CreateAdminAsync_ValidData_CreatesAdminSuccessfully()
    {
        // Arrange
        var dto = new CreateAdminDto
        {
            Name = "New Admin",
            Email = "newadmin@example.com",
            Password = "SecurePassword123!",
            Role = "Admin"
        };

        // Act
        var result = await _userService.CreateAdminAsync(dto);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("New Admin", result.Data.Name);
        Assert.Equal("newadmin@example.com", result.Data.Email);
        _passwordHasherMock.Verify(h => h.HashPassword("SecurePassword123!"), Times.Once);
    }

    [Fact]
    public async Task CreateAdminAsync_DuplicateEmail_ReturnsFailure()
    {
        // Arrange
        var existing = new User { Id = Guid.NewGuid(), Name = "Existing", Email = "existing@example.com", PasswordHash = "hash" };
        await _context.Users.AddAsync(existing);
        await _context.SaveChangesAsync();

        var dto = new CreateAdminDto
        {
            Name = "Duplicate Admin",
            Email = "existing@example.com",
            Password = "Password123"
        };

        // Act
        var result = await _userService.CreateAdminAsync(dto);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("already exists", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ToggleStatusAsync_SelfDeactivation_ReturnsFailure()
    {
        // Arrange
        var currentAdminId = Guid.NewGuid();
        var admin = new User { Id = currentAdminId, Name = "Current Admin", Email = "current@example.com", IsActive = true, Role = "Admin" };
        await _context.Users.AddAsync(admin);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.ToggleStatusAsync(currentAdminId, currentAdminId);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("cannot deactivate your own", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task DeleteAdminAsync_SelfDeletion_ReturnsFailure()
    {
        // Arrange
        var currentAdminId = Guid.NewGuid();
        var admin = new User { Id = currentAdminId, Name = "Current Admin", Email = "current@example.com", IsActive = true, Role = "Admin" };
        await _context.Users.AddAsync(admin);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.DeleteAdminAsync(currentAdminId, currentAdminId);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("cannot delete your own", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task DeleteAdminAsync_ValidTarget_DeletesSuccessfully()
    {
        // Arrange
        var currentAdminId = Guid.NewGuid();
        var currentAdmin = new User { Id = currentAdminId, Name = "Current Admin", Email = "current@example.com", IsActive = true, Role = "Admin" };
        var targetAdminId = Guid.NewGuid();
        var targetAdmin = new User { Id = targetAdminId, Name = "Target Admin", Email = "target@example.com", IsActive = true, Role = "Admin" };
        await _context.Users.AddRangeAsync(currentAdmin, targetAdmin);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.DeleteAdminAsync(targetAdminId, currentAdminId);

        // Assert
        Assert.True(result.Success);
        var found = await _context.Users.FindAsync(targetAdminId);
        Assert.Null(found);
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}

