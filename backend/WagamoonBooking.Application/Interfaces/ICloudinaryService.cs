using WagamoonBooking.Application.DTOs.PropertyImages;

namespace WagamoonBooking.Application.Interfaces;

public interface ICloudinaryService
{
    Task<ImageUploadResultDto> UploadImageAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    Task<bool> DeleteImageAsync(string publicId, CancellationToken ct = default);
}
