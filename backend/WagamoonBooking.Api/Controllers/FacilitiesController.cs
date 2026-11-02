using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.Facilities;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FacilitiesController : ControllerBase
{
    private readonly IFacilityService _facilityService;

    public FacilitiesController(IFacilityService facilityService)
    {
        _facilityService = facilityService;
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<List<FacilityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly, CancellationToken ct)
    {
        var result = await _facilityService.GetAllFacilitiesAsync(activeOnly, ct);
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<FacilityDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<FacilityDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateFacilityDto dto, CancellationToken ct)
    {
        var result = await _facilityService.CreateFacilityAsync(dto, ct);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FacilityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FacilityDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<FacilityDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFacilityDto dto, CancellationToken ct)
    {
        var result = await _facilityService.UpdateFacilityAsync(id, dto, ct);
        if (!result.Success)
        {
            if (result.Message == "Facility not found.")
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _facilityService.DeleteFacilityAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
