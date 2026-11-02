# ==========================================
# Multi-stage Dockerfile for ASP.NET Core 8
# Optimized for Render.com Web Services
# ==========================================

# 1. Build & Publish Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files for layer caching
COPY ["WagamoonBooking.sln", "./"]
COPY ["WagamoonBooking.Domain/WagamoonBooking.Domain.csproj", "WagamoonBooking.Domain/"]
COPY ["WagamoonBooking.Application/WagamoonBooking.Application.csproj", "WagamoonBooking.Application/"]
COPY ["WagamoonBooking.Infrastructure/WagamoonBooking.Infrastructure.csproj", "WagamoonBooking.Infrastructure/"]
COPY ["WagamoonBooking.Api/WagamoonBooking.Api.csproj", "WagamoonBooking.Api/"]
COPY ["WagamoonBooking.Tests/WagamoonBooking.Tests.csproj", "WagamoonBooking.Tests/"]

# Restore NuGet dependencies
RUN dotnet restore WagamoonBooking.sln

# Copy the remaining source files and compile
COPY . .
RUN dotnet publish "WagamoonBooking.Api/WagamoonBooking.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy compiled artifacts from build stage
COPY --from=build /app/publish .

# Render exposes the PORT environment variable dynamically (defaults to 8080)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "WagamoonBooking.Api.dll"]
