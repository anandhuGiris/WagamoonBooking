using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.StayCategories;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly IStayCategoryService _categoryService;

    public CategoriesController(IStayCategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<StayCategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly, CancellationToken ct)
    {
        var result = await _categoryService.GetAllCategoriesAsync(activeOnly, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _categoryService.GetCategoryByIdAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateStayCategoryDto dto, CancellationToken ct)
    {
        var result = await _categoryService.CreateCategoryAsync(dto, ct);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStayCategoryDto dto, CancellationToken ct)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto, ct);
        if (!result.Success)
        {
            if (result.Message == "Stay category not found.")
                return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _categoryService.DeleteCategoryAsync(id, ct);
        if (!result.Success)
        {
            if (result.Message == "Stay category not found.")
                return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPatch("{id:guid}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<StayCategoryDto>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleStatus(Guid id, CancellationToken ct)
    {
        var result = await _categoryService.ToggleStatusAsync(id, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }
}

