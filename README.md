# Wagamon Booking — Property Management Admin & Public API

A production-ready **Property Management Admin Application**, **Customer-Facing Public Website**, and **Public REST API** built for **Wagamon Booking**. 

The system allows administrators to manage boutique properties, adventure activities, categories, photo galleries, facilities, and publication statuses, while exposing an optimized, read-only public REST API that powers the customer-facing public website with direct **WhatsApp click-to-chat enquiry** links.

> [!NOTE]
> **Important Scope**: This is a property listing and enquiry management system. It does **not** handle room reservations, payments, or booking calendars. Customers discover properties and adventure activities on the public website and click "Enquire on WhatsApp" to initiate direct enquiries.

---

## Architecture Overview

```text
            CUSTOMER PUBLIC WEBSITE                ADMIN WEB APP
           (React 19 + Vite + TS)             (React 19 + MUI + TS)
                     │                                   │
                     │ GET /api/public/*                 │ /api/* (Admin JWT)
                     ▼                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │                 ASP.NET Core Web API                   │
        │                       (Backend)                        │
        └───────────────────────────┬────────────────────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
             PostgreSQL / SQLite              Cloudinary
            (Database Persistence)        (CDN Image Storage)
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
│   ├── wagamoon-booking-admin/            # React 19 + Vite + TypeScript MUI admin app
│   │   ├── src/
│   │   │   ├── api/                       # Axios client & typed endpoint services
│   │   │   ├── auth/                      # AuthContext & ProtectedRoute
│   │   │   ├── components/                # Layout, PropertyForm, Table, Uploader, Dialogs
│   │   │   ├── pages/                     # Login, Dashboard, Properties, Categories, Activities, Admins
│   │   │   ├── theme/                     # MUI design system theme
│   │   │   └── types/                     # TypeScript definitions
│   │   └── dist/                          # Production bundle
│   │
│   └── wagamoon-booking-public/           # React 19 + Vite + TypeScript customer website
│       ├── src/
│       │   ├── api/                       # Public API consumer (properties, activities, categories)
│       │   ├── components/                # Navbar, Hero, PropertyCard, ActivityCard, Footer
│       │   ├── pages/                     # Home, Properties, Details, Activities, About, Contact
│       │   └── styles/                    # Luxury resort styling & typography
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

### 5. Public API (Zero Authentication — For Public Website)
- `GET /api/public/properties` — Returns **only Active** properties. Inactive and Draft properties are strictly excluded. Supports `categoryId` / `categorySlug` filter.
- `GET /api/public/properties/{id}` — Details of single Active property.
- `GET /api/public/activities` — Returns **only Active** adventure activities.
- `GET /api/public/activities/{id}` — Details of single Active adventure activity.
- `GET /api/categories` — List active stay categories.

---

## Public Website (`frontend/wagamoon-booking-public`)

A standalone React 19 + TypeScript + Vite luxury boutique resort website for customers.

Features:
- **Curated Property Showcase**: Fetches only active villas and stays with high-resolution photography.
- **Adventure Activities**: Highlights thrilling Wagamon experiences and guided activities.
- **Direct WhatsApp Booking**: Generates direct WhatsApp click-to-chat links for instantaneous customer enquiries.
- **Mobile Optimized**: Responsive luxury resort design.

To run locally:
```bash
cd frontend/wagamoon-booking-public
npm install
npm run dev
```

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
