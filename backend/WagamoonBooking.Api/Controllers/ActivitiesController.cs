using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ActivityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActivities(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? activeOnly = null,
        CancellationToken ct = default)
    {
        var result = await _activityService.GetActivitiesAsync(page, pageSize, search, activeOnly, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _activityService.GetActivityByIdAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateActivityDto dto, CancellationToken ct)
    {
        var result = await _activityService.CreateActivityAsync(dto, ct);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateActivityDto dto, CancellationToken ct)
    {
        var result = await _activityService.UpdateActivityAsync(id, dto, ct);
        if (!result.Success)
        {
            if (result.Message == "Activity not found.")
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
        var result = await _activityService.DeleteActivityAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPatch("{id:guid}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<ActivityDetailDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleStatus(Guid id, CancellationToken ct)
    {
        var result = await _activityService.ToggleStatusAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }
}

