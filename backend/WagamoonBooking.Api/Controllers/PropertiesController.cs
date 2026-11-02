using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Dashboard;
using WagamoonBooking.Application.DTOs.Properties;
using WagamoonBooking.Application.Interfaces;
using WagamoonBooking.Domain.Enums;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _propertyService;

    public PropertiesController(IPropertyService propertyService)
    {
        _propertyService = propertyService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<PropertyDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProperties(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] PropertyStatus? status = null,
        CancellationToken ct = default)
    {
        var result = await _propertyService.GetPropertiesAsync(page, pageSize, search, status, ct);
        return Ok(result);
    }

    [HttpGet("dashboard/stats")]
    [ProducesResponseType(typeof(ApiResponse<DashboardStatsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
    {
        var result = await _propertyService.GetDashboardStatsAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPropertyById(Guid id, CancellationToken ct)
    {
        var result = await _propertyService.GetPropertyByIdAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProperty([FromBody] CreatePropertyDto dto, CancellationToken ct)
    {
        var result = await _propertyService.CreatePropertyAsync(dto, ct);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetPropertyById), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<PropertyDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProperty(Guid id, [FromBody] UpdatePropertyDto dto, CancellationToken ct)
    {
        var result = await _propertyService.UpdatePropertyAsync(id, dto, ct);
        if (!result.Success)
        {
            if (result.Message == "Property not found.")
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProperty(Guid id, CancellationToken ct)
    {
        var result = await _propertyService.DeletePropertyAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePropertyStatus(Guid id, [FromBody] UpdatePropertyStatusDto dto, CancellationToken ct)
    {
        var result = await _propertyService.UpdatePropertyStatusAsync(id, dto.Status, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
