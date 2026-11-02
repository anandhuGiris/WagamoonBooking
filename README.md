# Wagamon Booking — Property Management Admin & Public API

A production-ready **Property Management Admin Application** and **Public REST API** built for **Wagamon Booking**. 

The system allows administrators to manage boutique properties, photo galleries, facilities, and publication statuses, while exposing an optimized, read-only public REST API that powers the existing **GoDaddy Website Builder** public site with direct **WhatsApp click-to-chat enquiry** links.

> [!NOTE]
> **Important Scope**: This is a property listing and enquiry management system. It does **not** handle room reservations, payments, or booking calendars. Customers discover properties on the GoDaddy website and click "Contact on WhatsApp" to initiate direct enquiries.

---

## Architecture Overview

```text
                 EXISTING PUBLIC WEBSITE
                  (GoDaddy Website Builder)
                            │
                            │ GET /api/public/properties
                            ▼
               ┌───────────────────────────────┐
               │    ASP.NET Core Web API       │
               │        (Backend)              │
               │  /api/public/* (Anonymous)    │
               │  /api/properties/* (Admin JWT)│
               └──────────────┬────────────────┘
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
       SQL Server / SQLite              Cloudinary
       (Database Persistence)      (CDN Image Storage)
               ▲
               │ REST API (JWT Authenticated)
               │
       ┌───────────────────────────────┐
       │   React Admin Application     │
       │     (Vite + TypeScript)       │
       │      /dashboard, /properties  │
       └───────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0 Web API (C#)
- **Data Access**: Entity Framework Core 8.0
- **Database**: Microsoft SQL Server (with SQLite dev/test support)
- **Authentication**: JWT (JSON Web Tokens) with PBKDF2 / BCrypt password hashing
- **Validation**: FluentValidation
- **Media Storage**: CloudinaryDotNet CDN (with local static fallback)
- **Documentation**: Swagger / OpenAPI 3.0

### Frontend
- **Framework**: React 19 / Vite / TypeScript
- **UI Component Library**: Material UI (MUI v6/v7) with customized resort theme
- **Routing**: React Router
- **Forms & Validation**: React Hook Form + Zod
- **HTTP Client**: Axios with automatic JWT interceptors

---

## Project Structure

```text
WagamoonBooking/
│
├── backend/
│   ├── WagamoonBooking.sln
│   ├── WagamoonBooking.Domain/            # Clean POCO entities (Property, User, Facility, Image)
│   ├── WagamoonBooking.Application/       # DTOs, interfaces, services, FluentValidators
│   ├── WagamoonBooking.Infrastructure/    # DbContext, configurations, Cloudinary, JWT, Seeder
│   ├── WagamoonBooking.Api/               # Controllers, middleware, Program.cs, Swagger
│   └── WagamoonBooking.Tests/             # Unit and integration test suite (13 passing tests)
│
├── frontend/
│   └── wagamoon-booking-admin/            # React + Vite + TypeScript MUI admin app
│       ├── src/
│       │   ├── api/                       # Axios client & typed endpoint services
│       │   ├── auth/                      # AuthContext & ProtectedRoute
│       │   ├── components/                # Layout, PropertyForm, Table, Uploader, Dialogs
│       │   ├── pages/                     # Login, Dashboard, Properties, Add, Edit, Facilities
│       │   ├── theme/                     # MUI design system theme
│       │   └── types/                     # TypeScript definitions
│       └── dist/                          # Production bundle
│
├── .gitignore
└── README.md
```

---

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (v18+) & npm](https://nodejs.org/)
- SQL Server (LocalDB, Express, or standard SQL Server) OR SQLite

---

## Quick Start (Local Development)

### 1. Database & Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Restore dependencies and build the solution:
```bash
dotnet build
```

Run EF Core migrations (the database will automatically migrate and seed default administrator and facilities upon startup):
```bash
dotnet ef database update --project WagamoonBooking.Infrastructure --startup-project WagamoonBooking.Api
```

Run the backend API:
```bash
dotnet run --project WagamoonBooking.Api --launch-profile http
```

The API will start listening at:
- **API Base URL**: `http://localhost:5000`
- **Swagger Documentation**: `http://localhost:5000/swagger`

---

### 2. Frontend Setup

In a new terminal, navigate to the frontend directory:
```bash
cd frontend/wagamoon-booking-admin
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The admin web application will open at:
- **Admin App URL**: `http://localhost:5173`

---

## Default Administrator Credentials

During initial startup, the database is automatically seeded with default credentials:

| Field | Value |
|---|---|
| **Email** | `admin@example.com` |
| **Password** | `Admin@12345` |
| **Role** | `Admin` |

> [!TIP]
> On the `/login` page, you can simply click the **"Fill Demo Credentials"** button to auto-populate the email and password instantly.

---

## Environment Variables & Configuration

### Backend (`appsettings.json` / Environment Variables)

| Key | Description | Default / Example |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Database connection string | `Host=ep-xxx.neon.tech;Database=neondb;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true` |
| `DatabaseProvider` | Database engine (`PostgreSql`, `Sqlite`, or `SqlServer`) | `PostgreSql` |
| `Jwt__Key` | Secret key for signing JWT tokens | High-entropy secret key string |
| `Jwt__Issuer` | Token issuer claim | `WagamonBookingApi` |
| `Jwt__Audience` | Token audience claim | `WagamonBookingAdmin` |
| `Cloudinary__CloudName` | Cloudinary Cloud Name | `your-cloud-name` |
| `Cloudinary__ApiKey` | Cloudinary API Key | `your-api-key` |
| `Cloudinary__ApiSecret` | Cloudinary API Secret | `your-api-secret` |

*Note: If Cloudinary credentials are not configured or set to default placeholders, the backend runs in local-fallback mode, storing uploaded images in `wwwroot/uploads` so you can test image workflows offline without mandatory Cloudinary credentials.*

### Frontend (`.env` / `frontend/wagamoon-booking-admin/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base endpoint URL for ASP.NET Core API | `http://localhost:5000/api` |

---

## API Endpoints

### 1. Authentication
- `POST /api/auth/login` — Authenticate admin and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated administrator profile.

### 2. Admin Property Management (Requires Bearer Token)
- `GET /api/properties?page=1&pageSize=10&search=lake&status=Active` — Paginated property list with search and filtering.
- `GET /api/properties/dashboard/stats` — Metrics for Dashboard (Total, Active, Draft, Inactive counts and recent properties).
- `GET /api/properties/{id}` — Full details with images and facilities.
- `POST /api/properties` — Create a new property.
- `PUT /api/properties/{id}` — Update existing property details.
- `DELETE /api/properties/{id}` — Delete property and purge associated Cloudinary assets.
- `PATCH /api/properties/{id}/status` — Toggle property status (`Active`, `Draft`, `Inactive`).

### 3. Property Images (Requires Bearer Token)
- `POST /api/properties/{id}/images` — Multi-image upload to Cloudinary (validates JPEG, PNG, WebP <10MB).
- `DELETE /api/properties/{id}/images/{imageId}` — Delete image from database and Cloudinary.
- `PUT /api/properties/{id}/images/reorder` — Reorder gallery sort sequence.
- `PUT /api/properties/{id}/images/{imageId}/primary` — Set designated primary cover photo.

### 4. Facilities (Requires Bearer Token)
- `GET /api/facilities` — List all amenities (WiFi, Parking, Swimming Pool, Lake View, etc.).
- `POST /api/facilities` — Add new facility.
- `PUT /api/facilities/{id}` — Update facility name or active status.
- `DELETE /api/facilities/{id}` — Delete facility.

### 5. Public API (Zero Authentication — For GoDaddy Website)
- `GET /api/public/properties` — Returns **only Active** properties. Inactive and Draft properties are strictly excluded.
- `GET /api/public/properties/{id}` — Details of single Active property.

---

## GoDaddy Website Integration Guide

To render live properties on your GoDaddy website:

1. Open your **GoDaddy Website Builder**.
2. Add an **"HTML / Custom Code"** section where you want property cards to appear.
3. Paste the following snippet:

```html
<!-- Wagamon Booking GoDaddy Custom HTML Block -->
<div id="wagamon-properties-container"></div>
<script>
  (async function() {
    const API_URL = 'https://api.yourdomain.com/api/public/properties'; // Replace with your production API URL
    const container = document.getElementById('wagamon-properties-container');
    try {
      const response = await fetch(API_URL);
      const res = await response.json();
      if (!res.success || !res.data || res.data.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#64748b;">No properties currently available.</p>';
        return;
      }
      
      const cards = res.data.map(p => {
        const primaryImg = p.images.find(img => img.isPrimary)?.url || (p.images[0]?.url || 'https://via.placeholder.com/600x400?text=Wagamon+Property');
        const facilities = p.facilities.map(f => '<span style="display:inline-block;background:#f1f5f9;color:#334155;font-size:12px;padding:3px 8px;border-radius:4px;margin:2px 4px 2px 0;">✓ ' + f + '</span>').join('');
        
        return `
          <div style="background:#ffffff;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.08);overflow:hidden;display:flex;flex-direction:column;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="height:220px;overflow:hidden;position:relative;">
              <img src="${primaryImg}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" />
            </div>
            <div style="padding:20px;flex-grow:1;display:flex;flex-direction:column;">
              <h3 style="margin:0 0 6px 0;font-size:20px;color:#0f172a;">${p.name}</h3>
              <p style="margin:0 0 12px 0;color:#64748b;font-size:14px;">📍 ${p.location}</p>
              <p style="margin:0 0 16px 0;color:#334155;font-size:14px;line-height:1.5;flex-grow:1;">${p.description}</p>
              <div style="margin-bottom:18px;">${facilities}</div>
              <a href="${p.whatsAppUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;background:#25D366;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;font-size:15px;box-shadow:0 4px 12px rgba(37,211,102,0.3);text-align:center;">
                💬 Contact on WhatsApp
              </a>
            </div>
          </div>
        `;
      }).join('');
      
      container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:24px;padding:16px 0;">' + cards + '</div>';
    } catch (e) {
      container.innerHTML = '<p style="color:#ef4444;text-align:center;padding:2rem;">Unable to load properties. Please try again later.</p>';
    }
  })();
</script>
```

4. Publish your GoDaddy website. Whenever an admin creates or activates a property in the admin dashboard, it will appear on the website automatically.

---

## Running the Automated Test Suite

Run all backend unit and integration tests:
```bash
cd backend
dotnet test
```

All 13 test scenarios pass:
- Login authentication & token validation
- Invalid password & non-existent user handling
- Inactive user rejection
- Property validation (name, description, phone format)
- Public API filtering (only Active properties, excluding Draft and Inactive)
- Property status updating & deletion cascade
- Image management, primary cover switching, and reordering

---

## Production Build

### Backend
```bash
cd backend/WagamoonBooking.Api
dotnet publish -c Release -o ../publish
```

### Frontend
```bash
cd frontend/wagamoon-booking-admin
npm run build
```
The optimized static bundle is located in `frontend/wagamoon-booking-admin/dist/`.
