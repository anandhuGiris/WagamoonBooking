using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WagamoonBooking.Application.DTOs.PropertyImages;
using WagamoonBooking.Application.Interfaces;

namespace WagamoonBooking.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;
    private readonly bool _isConfigured;

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        var cloudName = configuration["Cloudinary:CloudName"] ?? configuration["Cloudinary__CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"] ?? configuration["Cloudinary__ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"] ?? configuration["Cloudinary__ApiSecret"];

        if (!string.IsNullOrWhiteSpace(cloudName) &&
            !string.IsNullOrWhiteSpace(apiKey) &&
            !string.IsNullOrWhiteSpace(apiSecret) &&
            cloudName != "your-cloud-name")
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            _isConfigured = true;
            _logger.LogInformation("Cloudinary service initialized successfully for cloud {CloudName}", cloudName);
        }
        else
        {
            _isConfigured = false;
            _logger.LogWarning("Cloudinary credentials are not configured or using placeholders. Mock/local fallback mode enabled.");
        }
    }

    public async Task<ImageUploadResultDto> UploadImageAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(contentType.ToLower()))
        {
            throw new ArgumentException("Invalid image format. Allowed formats are JPEG, PNG, and WebP.");
        }

        if (_isConfigured && _cloudinary != null)
        {
            fileStream.Position = 0;
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "wagamon-properties",
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, ct);

            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error.Message);
                throw new InvalidOperationException($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            return new ImageUploadResultDto
            {
                Url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty,
                PublicId = uploadResult.PublicId
            };
        }
        else
        {
            // Dev Fallback: write to local wwwroot/uploads directory so developers can test immediately without Cloudinary account
            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsDir))
            {
                Directory.CreateDirectory(uploadsDir);
            }

            var extension = Path.GetExtension(fileName);
            var safeName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsDir, safeName);

            fileStream.Position = 0;
            using (var outputStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(outputStream, ct);
            }

            var localUrl = $"/uploads/{safeName}";
            _logger.LogInformation("Image saved locally at {LocalUrl} (Cloudinary credentials not provided)", localUrl);

            return new ImageUploadResultDto
            {
                Url = localUrl,
                PublicId = $"local_{safeName}"
            };
        }
    }

    public async Task<bool> DeleteImageAsync(string publicId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(publicId)) return false;

        if (_isConfigured && _cloudinary != null && !publicId.StartsWith("local_"))
        {
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);
            return result.Result == "ok";
        }
        else if (publicId.StartsWith("local_"))
        {
            var fileName = publicId.Replace("local_", "");
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            return true;
        }

        return true;
    }
}
