using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using WagamoonBooking.Infrastructure.Data;

namespace WagamoonBooking.Tests.TestHelpers;

public static class TestDbContextFactory
{
    public static (ApplicationDbContext Context, SqliteConnection Connection) CreateInMemoryDbContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();

        return (context, connection);
    }
}
