using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.StayCategories;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/public/categories")]
[AllowAnonymous]
public class PublicCategoriesController : ControllerBase
{
    private readonly IStayCategoryService _categoryService;

    public PublicCategoriesController(IStayCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Returns all Active stay categories for public filtering.
    /// Inactive categories are excluded.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PublicStayCategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveCategories(CancellationToken ct)
    {
        var result = await _categoryService.GetPublicCategoriesAsync(ct);
        return Ok(result);
    }
}

