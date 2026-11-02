using FluentValidation;
using WagamoonBooking.Application.DTOs.Auth;
using WagamoonBooking.Application.DTOs.Facilities;
using WagamoonBooking.Application.DTOs.Properties;

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
