using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Application.Services;

namespace WagamoonBooking.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IFacilityService, FacilityService>();
        services.AddScoped<IPropertyService, PropertyService>();
        services.AddScoped<IStayCategoryService, StayCategoryService>();
        services.AddScoped<IActivityService, ActivityService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
