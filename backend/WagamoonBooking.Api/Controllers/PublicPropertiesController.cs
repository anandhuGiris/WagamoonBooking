using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/public/properties")]
[AllowAnonymous]
public class PublicPropertiesController : ControllerBase
{
    private readonly IPropertyService _propertyService;
    private readonly IConfiguration _configuration;

    public PublicPropertiesController(IPropertyService propertyService, IConfiguration configuration)
    {
        _propertyService = propertyService;
        _configuration = configuration;
    }

    /// <summary>
    /// Returns all Active properties for the public customer-facing website.
    /// Inactive and Draft properties are strictly excluded.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PublicPropertyDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveProperties(
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? categorySlug = null,
        CancellationToken ct = default)
    {
        var result = await _propertyService.GetPublicPropertiesAsync(categoryId, categorySlug, ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns single Active property details by Id.
    /// Returns 404 if property is not active or not found.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicPropertyDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PublicPropertyDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetActivePropertyById(Guid id, CancellationToken ct)
    {
        var result = await _propertyService.GetPublicPropertyByIdAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Re-routes directly to WhatsApp with a pre-filled enquiry message containing the property product link.
    /// </summary>
    [HttpGet("{id:guid}/whatsapp")]
    public async Task<IActionResult> ReRouteToWhatsApp(Guid id, CancellationToken ct)
    {
        var result = await _propertyService.GetPublicPropertyByIdAsync(id, ct);
        if (!result.Success || result.Data == null)
        {
            return NotFound(ApiResponse<string>.FailureResult("Property not found or is currently inactive."));
        }

        var whatsappUrl = result.Data.WhatsAppUrl;
        if (string.IsNullOrWhiteSpace(whatsappUrl))
        {
            return BadRequest(ApiResponse<string>.FailureResult("WhatsApp contact number is not configured for this property."));
        }

        return Redirect(whatsappUrl);
    }

    /// <summary>
    /// Fallback re-route for unpersisted forms or concierge enquiry.
    /// </summary>
    [HttpGet("whatsapp/redirect")]
    public IActionResult RedirectToWhatsApp(
        [FromQuery] string phone,
        [FromQuery] string? name = null,
        [FromQuery] Guid? id = null)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return BadRequest(ApiResponse<string>.FailureResult("Phone number is required."));
        }

        var cleanNumber = Regex.Replace(phone, @"[^\d]", "");
        var baseUrl = _configuration["PublicWebsite:BaseUrl"]
            ?? Environment.GetEnvironmentVariable("PUBLIC_WEBSITE_BASE_URL")
            ?? "https://wagamoonbooking.com";
        baseUrl = baseUrl.TrimEnd('/');

        string message;
        if (id.HasValue && id.Value != Guid.Empty)
        {
            var productUrl = $"{baseUrl}/properties/{id.Value}";
            message = $"Hello, I'm interested in booking {name ?? "this property"} in Wagamon.\n\nProperty Details: {productUrl}\n\nPlease share availability and rates.";
        }
        else
        {
            message = $"Hello, I'm interested in booking {name ?? "this property"} in Wagamon. Please share availability and rates.";
        }

        var whatsappUrl = $"https://wa.me/{cleanNumber}?text={Uri.EscapeDataString(message)}";
        return Redirect(whatsappUrl);
    }
}
