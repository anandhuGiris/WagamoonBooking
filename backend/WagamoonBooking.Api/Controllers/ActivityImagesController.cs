using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Activities;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/activities/{activityId:guid}/images")]
[Authorize]
public class ActivityImagesController : ControllerBase
{
    private readonly IActivityService _activityService;
    private readonly ICloudinaryService _cloudinaryService;
    private const long MaxFileSizeInBytes = 10 * 1024 * 1024; // 10MB

    public ActivityImagesController(IActivityService activityService, ICloudinaryService cloudinaryService)
    {
        _activityService = activityService;
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB for batch
    [ProducesResponseType(typeof(ApiResponse<List<ActivityImageDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<List<ActivityImageDto>>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImages(
        Guid activityId,
        [FromForm] List<IFormFile> files,
        [FromForm] bool isPrimary = false,
        CancellationToken ct = default)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<List<ActivityImageDto>>.FailureResult("No files were provided for upload."));
        }

        var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        var uploadedImages = new List<ActivityImageDto>();

        foreach (var file in files)
        {
            if (file.Length == 0)
                continue;

            if (file.Length > MaxFileSizeInBytes)
            {
                return BadRequest(ApiResponse<List<ActivityImageDto>>.FailureResult($"File '{file.FileName}' exceeds the maximum allowed size of 10MB."));
            }

            if (!allowedMimeTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(ApiResponse<List<ActivityImageDto>>.FailureResult($"File '{file.FileName}' has an unsupported format. Allowed formats: JPEG, PNG, WebP."));
            }

            using var stream = file.OpenReadStream();
            var uploadResult = await _cloudinaryService.UploadImageAsync(stream, file.FileName, file.ContentType, ct);

            var dbResult = await _activityService.AddImageAsync(
                activityId,
                uploadResult.Url,
                uploadResult.PublicId,
                isPrimary && uploadedImages.Count == 0,
                ct);

            if (dbResult.Success && dbResult.Data != null)
            {
                uploadedImages.Add(dbResult.Data);
            }
        }

        return Ok(ApiResponse<List<ActivityImageDto>>.SuccessResult(uploadedImages, "Images uploaded successfully."));
    }

    [HttpDelete("{imageId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(Guid activityId, Guid imageId, CancellationToken ct)
    {
        var result = await _activityService.DeleteImageAsync(activityId, imageId, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPut("{imageId:guid}/primary")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrimaryImage(Guid activityId, Guid imageId, CancellationToken ct)
    {
        var result = await _activityService.SetPrimaryImageAsync(activityId, imageId, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPut("reorder")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderImages(Guid activityId, [FromBody] ReorderActivityImagesDto dto, CancellationToken ct)
    {
        var result = await _activityService.ReorderImagesAsync(activityId, dto.ImageIds, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }
}

