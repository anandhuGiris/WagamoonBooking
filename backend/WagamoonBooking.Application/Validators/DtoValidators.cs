using FluentValidation;
using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.DTOs.Auth;
using WagamoonBooking.Application.DTOs.Facilities;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Application.DTOs.StayCategories;
using WagamoonBooking.Application.DTOs.Users;

namespace WagamoonBooking.Application.Validators;

public class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class CreatePropertyDtoValidator : AbstractValidator<CreatePropertyDto>
{
    public CreatePropertyDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Property name is required.")
            .MaximumLength(200).WithMessage("Property name cannot exceed 200 characters.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Stay category is required.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters long.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

        RuleFor(x => x.Bedrooms)
            .GreaterThanOrEqualTo(0).When(x => x.Bedrooms.HasValue)
            .WithMessage("Bedrooms must be a non-negative integer.");

        RuleFor(x => x.Bathrooms)
            .GreaterThanOrEqualTo(0).When(x => x.Bathrooms.HasValue)
            .WithMessage("Bathrooms must be a non-negative integer.");

        RuleFor(x => x.MaxGuests)
            .GreaterThan(0).When(x => x.MaxGuests.HasValue)
            .WithMessage("Maximum guests must be a positive integer.");

        RuleFor(x => x.WhatsAppNumber)
            .NotEmpty().WithMessage("WhatsApp number is required.")
            .Matches(@"^\+?[1-9]\d{6,14}$").WithMessage("Please enter a valid phone number (e.g., +919876543210 or 919876543210).");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid property status.");
    }
}

public class UpdatePropertyDtoValidator : AbstractValidator<UpdatePropertyDto>
{
    public UpdatePropertyDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Property name is required.")
            .MaximumLength(200).WithMessage("Property name cannot exceed 200 characters.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Stay category is required.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters long.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

        RuleFor(x => x.Bedrooms)
            .GreaterThanOrEqualTo(0).When(x => x.Bedrooms.HasValue)
            .WithMessage("Bedrooms must be a non-negative integer.");

        RuleFor(x => x.Bathrooms)
            .GreaterThanOrEqualTo(0).When(x => x.Bathrooms.HasValue)
            .WithMessage("Bathrooms must be a non-negative integer.");

        RuleFor(x => x.MaxGuests)
            .GreaterThan(0).When(x => x.MaxGuests.HasValue)
            .WithMessage("Maximum guests must be a positive integer.");

        RuleFor(x => x.WhatsAppNumber)
            .NotEmpty().WithMessage("WhatsApp number is required.")
            .Matches(@"^\+?[1-9]\d{6,14}$").WithMessage("Please enter a valid phone number (e.g., +919876543210 or 919876543210).");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid property status.");
    }
}

public class CreateFacilityDtoValidator : AbstractValidator<CreateFacilityDto>
{
    public CreateFacilityDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Facility name is required.")
            .MaximumLength(100).WithMessage("Facility name cannot exceed 100 characters.");
    }
}

public class CreateStayCategoryDtoValidator : AbstractValidator<CreateStayCategoryDto>
{
    public CreateStayCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.Slug)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").When(x => !string.IsNullOrWhiteSpace(x.Slug))
            .WithMessage("Slug may only contain lowercase letters, numbers, and hyphens.");
    }
}

public class UpdateStayCategoryDtoValidator : AbstractValidator<UpdateStayCategoryDto>
{
    public UpdateStayCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");

        RuleFor(x => x.Slug)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").When(x => !string.IsNullOrWhiteSpace(x.Slug))
            .WithMessage("Slug may only contain lowercase letters, numbers, and hyphens.");
    }
}

public class CreateActivityDtoValidator : AbstractValidator<CreateActivityDto>
{
    public CreateActivityDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Activity name is required.")
            .MaximumLength(200).WithMessage("Activity name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters long.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

        RuleFor(x => x.Duration)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Duration))
            .WithMessage("Duration cannot exceed 100 characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue)
            .WithMessage("Price must be a non-negative value.");

        RuleFor(x => x.WhatsAppNumber)
            .Matches(@"^\+?[1-9]\d{6,14}$").When(x => !string.IsNullOrWhiteSpace(x.WhatsAppNumber))
            .WithMessage("Please enter a valid phone number (e.g., +919876543210).");

        RuleFor(x => x.Slug)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").When(x => !string.IsNullOrWhiteSpace(x.Slug))
            .WithMessage("Slug may only contain lowercase letters, numbers, and hyphens.");
    }
}

public class UpdateActivityDtoValidator : AbstractValidator<UpdateActivityDto>
{
    public UpdateActivityDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Activity name is required.")
            .MaximumLength(200).WithMessage("Activity name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MinimumLength(10).WithMessage("Description must be at least 10 characters long.");

        RuleFor(x => x.Location)
            .NotEmpty().WithMessage("Location is required.")
            .MaximumLength(200).WithMessage("Location cannot exceed 200 characters.");

        RuleFor(x => x.Duration)
            .MaximumLength(100).When(x => !string.IsNullOrEmpty(x.Duration))
            .WithMessage("Duration cannot exceed 100 characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).When(x => x.Price.HasValue)
            .WithMessage("Price must be a non-negative value.");

        RuleFor(x => x.WhatsAppNumber)
            .Matches(@"^\+?[1-9]\d{6,14}$").When(x => !string.IsNullOrWhiteSpace(x.WhatsAppNumber))
            .WithMessage("Please enter a valid phone number (e.g., +919876543210).");

        RuleFor(x => x.Slug)
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$").When(x => !string.IsNullOrWhiteSpace(x.Slug))
            .WithMessage("Slug may only contain lowercase letters, numbers, and hyphens.");
    }
}


public class CreateAdminDtoValidator : AbstractValidator<CreateAdminDto>
{
    public CreateAdminDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Full Name is required.")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(256).WithMessage("Email cannot exceed 256 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters.");
    }
}

public class UpdateAdminDtoValidator : AbstractValidator<UpdateAdminDto>
{
    public UpdateAdminDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Full Name is required.")
            .MaximumLength(150).WithMessage("Name cannot exceed 150 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(256).WithMessage("Email cannot exceed 256 characters.");

        RuleFor(x => x.Password)
            .MinimumLength(6).When(x => !string.IsNullOrWhiteSpace(x.Password))
            .WithMessage("Password must be at least 6 characters long.")
            .MaximumLength(100).When(x => !string.IsNullOrWhiteSpace(x.Password))
            .WithMessage("Password cannot exceed 100 characters.");
    }
}
