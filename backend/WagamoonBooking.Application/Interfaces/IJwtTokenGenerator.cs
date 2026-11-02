using WagamoonBooking.Domain.Entities;

namespace WagamoonBooking.Application.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) GenerateToken(User user);
}
