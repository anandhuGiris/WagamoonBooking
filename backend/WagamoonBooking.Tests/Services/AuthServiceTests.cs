using Moq;
using WagamoonBooking.Application.DTOs.Auth;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Application.Services;
using WagamoonBooking.Application.Validators;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Tests.TestHelpers;
using Xunit;

namespace WagamoonBooking.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly Application.Interfaces.IApplicationDbContext _context;
    private readonly IDisposable _connection;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenGenerator> _jwtTokenGeneratorMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var (context, connection) = TestDbContextFactory.CreateInMemoryDbContext();
        _context = context;
        _connection = connection;

        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtTokenGeneratorMock = new Mock<IJwtTokenGenerator>();
        var validator = new LoginRequestDtoValidator();

        _authService = new AuthService(
            _context,
            _passwordHasherMock.Object,
            _jwtTokenGeneratorMock.Object,
            validator);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokenAndUser()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            Name = "Admin User",
            PasswordHash = "hashed_secret",
            Role = "Admin",
            IsActive = true
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        _passwordHasherMock
            .Setup(p => p.VerifyPassword("Password123!", "hashed_secret"))
            .Returns(true);

        _jwtTokenGeneratorMock
            .Setup(j => j.GenerateToken(It.IsAny<User>()))
            .Returns(("mock.jwt.token", DateTime.UtcNow.AddHours(24)));

        var request = new LoginRequestDto
        {
            Email = "admin@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.Equal("mock.jwt.token", result.Data.Token);
        Assert.Equal("admin@example.com", result.Data.User.Email);
        Assert.Equal("Admin", result.Data.User.Role);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ReturnsFailure()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            Name = "Admin User",
            PasswordHash = "hashed_secret",
            Role = "Admin",
            IsActive = true
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        _passwordHasherMock
            .Setup(p => p.VerifyPassword("WrongPassword", "hashed_secret"))
            .Returns(false);

        var request = new LoginRequestDto
        {
            Email = "admin@example.com",
            Password = "WrongPassword"
        };

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Equal("Invalid email or password.", result.Message);
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ReturnsAccountDeactivated()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "inactive@example.com",
            Name = "Inactive Admin",
            PasswordHash = "hashed_secret",
            Role = "Admin",
            IsActive = false
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        _passwordHasherMock
            .Setup(p => p.VerifyPassword("Password123!", "hashed_secret"))
            .Returns(true);

        var request = new LoginRequestDto
        {
            Email = "inactive@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await _authService.LoginAsync(request);

        // Assert
        Assert.False(result.Success);
        Assert.Contains("deactivated", result.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task LoginAsync_InvalidEmailFormat_ReturnsValidationFailure()
    {
        // Act
        var result = await _authService.LoginAsync(new LoginRequestDto
        {
            Email = "not-an-email",
            Password = "Password123!"
        });

        // Assert
        Assert.False(result.Success);
        Assert.NotNull(result.Errors);
        Assert.Contains(result.Errors, e => e.Field.Equals("Email", StringComparison.OrdinalIgnoreCase));
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}
