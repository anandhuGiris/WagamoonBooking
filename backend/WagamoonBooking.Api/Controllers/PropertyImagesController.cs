using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WagamoonBooking.Application.DTOs.Common;
using WagamoonBooking.Application.DTOs.PropertyImages;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Api.Controllers;

[ApiController]
[Route("api/properties/{propertyId:guid}/images")]
[Authorize]
public class PropertyImagesController : ControllerBase
{
    private readonly IPropertyService _propertyService;
    private readonly ICloudinaryService _cloudinaryService;
    private const long MaxFileSizeInBytes = 10 * 1024 * 1024; // 10MB

    public PropertyImagesController(IPropertyService propertyService, ICloudinaryService cloudinaryService)
    {
        _propertyService = propertyService;
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB for batch
    [ProducesResponseType(typeof(ApiResponse<List<PropertyImageDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<List<PropertyImageDto>>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadImages(
        Guid propertyId,
        [FromForm] List<IFormFile> files,
        [FromForm] bool isPrimary = false,
        CancellationToken ct = default)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<List<PropertyImageDto>>.FailureResult("No files were provided for upload."));
        }

        var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        var uploadedImages = new List<PropertyImageDto>();

        foreach (var file in files)
        {
            if (file.Length == 0)
                continue;

            if (file.Length > MaxFileSizeInBytes)
            {
                return BadRequest(ApiResponse<List<PropertyImageDto>>.FailureResult($"File '{file.FileName}' exceeds the maximum allowed size of 10MB."));
            }

            if (!allowedMimeTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(ApiResponse<List<PropertyImageDto>>.FailureResult($"File '{file.FileName}' has an unsupported format. Allowed formats: JPEG, PNG, WebP."));
            }

            using var stream = file.OpenReadStream();
            var uploadResult = await _cloudinaryService.UploadImageAsync(stream, file.FileName, file.ContentType, ct);

            var dbResult = await _propertyService.AddImageAsync(
                propertyId,
                uploadResult.Url,
                uploadResult.PublicId,
                isPrimary && uploadedImages.Count == 0,
                ct);

            if (dbResult.Success && dbResult.Data != null)
            {
                uploadedImages.Add(dbResult.Data);
            }
        }

        return Ok(ApiResponse<List<PropertyImageDto>>.SuccessResult(uploadedImages, "Images uploaded successfully."));
    }

    [HttpDelete("{imageId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(Guid propertyId, Guid imageId, CancellationToken ct)
    {
        var result = await _propertyService.DeleteImageAsync(propertyId, imageId, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPut("{imageId:guid}/primary")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPrimaryImage(Guid propertyId, Guid imageId, CancellationToken ct)
    {
        var result = await _propertyService.SetPrimaryImageAsync(propertyId, imageId, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpPut("reorder")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderImages(Guid propertyId, [FromBody] ReorderImagesDto dto, CancellationToken ct)
    {
        var result = await _propertyService.ReorderImagesAsync(propertyId, dto.ImageIds, ct);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
