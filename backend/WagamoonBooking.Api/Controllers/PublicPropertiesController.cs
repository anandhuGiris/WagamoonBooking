using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public PublicPropertiesController(IPropertyService propertyService)
    {
        _propertyService = propertyService;
    }

    /// <summary>
    /// Returns all Active properties for the public website / GoDaddy integration.
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
}
