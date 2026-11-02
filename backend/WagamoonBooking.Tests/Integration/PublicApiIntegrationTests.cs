using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Domain.Entities;
using WagamoonBooking.Domain.Enums;
using WagamoonBooking.Infrastructure.Data;
using Xunit;

namespace WagamoonBooking.Tests.Integration;

public class PublicApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly string _dbName = "IntegrationTestDb_" + Guid.NewGuid();

    public PublicApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureServices(services =>
            {
                // Replace DbContext with in-memory database for testing
                var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                });
            });
        });
    }

    [Fact]
    public async Task GetPublicProperties_ReturnsOk_WithoutAuthentication()
    {
        // Arrange
        var client = _factory.CreateClient();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await db.Database.EnsureCreatedAsync();

            var prop = new Property
            {
                Id = Guid.NewGuid(),
                Name = "Integration Test Active Villa",
                Description = "A publicly visible test villa for integration test.",
                Location = "Wagamoon Hills",
                WhatsAppNumber = "+919876543210",
                Status = PropertyStatus.Active
            };
            db.Properties.Add(prop);
            await db.SaveChangesAsync();
        }

        // Act
        var response = await client.GetAsync("/api/public/properties");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<PublicPropertyDto>>>();
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotEmpty(result.Data!);
    }

    [Fact]
    public async Task GetAdminProperties_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/api/properties");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
