using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Infrastructure.Data;
using WagamoonBooking.Infrastructure.Services;

namespace WagamoonBooking.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration["DatabaseProvider"] ?? "SqlServer";
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=.\\SQL_SERVER;Database=WagamonBookingDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (provider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase) ||
                provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase) ||
                provider.Equals("Npgsql", StringComparison.OrdinalIgnoreCase))
            {
                var npgsqlConnStr = FormatPostgreSqlConnectionString(connectionString);
                options.UseNpgsql(npgsqlConnStr, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorCodesToAdd: null);
                });
            }
            else if (provider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString);
            }
            else
            {
                options.UseSqlServer(connectionString, sqlServerOptions =>
                {
                    sqlServerOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                });
            }
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();

        return services;
    }

    private static string FormatPostgreSqlConnectionString(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return raw;

        if (raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            var uri = new Uri(raw);
            var userInfo = uri.UserInfo.Split(':', 2);
            var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var database = uri.AbsolutePath.TrimStart('/');
            if (string.IsNullOrEmpty(database)) database = "neondb";

            return $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
        }

        return raw;
    }
}
