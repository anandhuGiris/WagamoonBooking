using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/public/activities")]
[AllowAnonymous]
public class PublicActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;

    public PublicActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    /// <summary>
    /// Returns all Active adventure activities for the public website.
    /// Inactive activities are strictly excluded.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PublicActivityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveActivities(CancellationToken ct)
    {
        var result = await _activityService.GetPublicActivitiesAsync(ct);
        return Ok(result);
    }

    /// <summary>
    /// Returns single Active adventure activity details by Id.
    /// Returns 404 if activity is not active or not found.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PublicActivityDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<PublicActivityDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetActiveActivityById(Guid id, CancellationToken ct)
    {
        var result = await _activityService.GetPublicActivityByIdAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}

