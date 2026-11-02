namespace WagamoonBooking.Application.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<ValidationErrorDto>? Errors { get; set; }

    public static ApiResponse<T> SuccessResult(T data, string message = "")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> FailureResult(string message, List<ValidationErrorDto>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<ValidationErrorDto>()
        };
    }
}

public class ValidationErrorDto
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public ValidationErrorDto() { }

    public ValidationErrorDto(string field, string message)
    {
        Field = field;
        Message = message;
    }
}
