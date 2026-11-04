-- ===================================================================================
-- Wagamon Booking: Safe Migration for Stay Categories & Adventure Activities
-- Compatible with live PostgreSQL database without losing existing property records.
-- ===================================================================================

-- 1. Create StayCategories table
CREATE TABLE IF NOT EXISTS "StayCategories" (
    "Id" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Slug" character varying(120) NOT NULL,
    "Description" character varying(500) NULL,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    "UpdatedAt" timestamp with time zone NULL,
    CONSTRAINT "PK_StayCategories" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_StayCategories_Name" ON "StayCategories" ("Name");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_StayCategories_Slug" ON "StayCategories" ("Slug");
CREATE INDEX IF NOT EXISTS "IX_StayCategories_IsActive" ON "StayCategories" ("IsActive");
CREATE INDEX IF NOT EXISTS "IX_StayCategories_DisplayOrder" ON "StayCategories" ("DisplayOrder");

-- 2. Seed default categories if none exist
INSERT INTO "StayCategories" ("Id", "Name", "Slug", "Description", "IsActive", "DisplayOrder", "CreatedAt")
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Villa', 'villa', 'Exclusive private villas offering scenic hillside seclusion and luxury amenities.', TRUE, 1, NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Resort', 'resort', 'Full-service boutique nature resorts with premium hospitality and experiences.', TRUE, 2, NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Cottage', 'cottage', 'Charming stone and timber cottages surrounded by rolling tea plantations.', TRUE, 3, NOW()),
    ('44444444-4444-4444-4444-444444444444', 'Home Stay', 'home-stay', 'Authentic high-range hospitality with personalized local guidance and meals.', TRUE, 4, NOW()),
    ('55555555-5555-5555-5555-555555555555', 'Tree House', 'tree-house', 'Elevated tree houses amidst the forest canopy with sweeping valley views.', TRUE, 5, NOW()),
    ('66666666-6666-6666-6666-666666666666', 'Farm Stay', 'farm-stay', 'Idyllic rural farm cottages offering peaceful eco-friendly retreats.', TRUE, 6, NOW())
ON CONFLICT ("Slug") DO NOTHING;

-- 3. Safely add CategoryId column to Properties if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Properties' AND column_name = 'CategoryId'
    ) THEN
        ALTER TABLE "Properties" ADD COLUMN "CategoryId" uuid NULL;
    END IF;
END $$;

-- 4. Assign existing properties to the default 'Villa' category
UPDATE "Properties" 
SET "CategoryId" = '11111111-1111-1111-1111-111111111111' 
WHERE "CategoryId" IS NULL OR "CategoryId" = '00000000-0000-0000-0000-000000000000';

-- 5. Enforce NOT NULL and foreign key constraint with RESTRICT delete behavior
ALTER TABLE "Properties" ALTER COLUMN "CategoryId" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_Properties_StayCategories_CategoryId'
    ) THEN
        ALTER TABLE "Properties" 
        ADD CONSTRAINT "FK_Properties_StayCategories_CategoryId" 
        FOREIGN KEY ("CategoryId") REFERENCES "StayCategories" ("Id") ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IX_Properties_CategoryId" ON "Properties" ("CategoryId");

-- 6. Create Activities table
CREATE TABLE IF NOT EXISTS "Activities" (
    "Id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Slug" character varying(220) NOT NULL,
    "Description" text NOT NULL,
    "Location" character varying(200) NOT NULL,
    "Duration" character varying(100) NULL,
    "Price" numeric(18,2) NULL,
    "WhatsAppNumber" character varying(30) NULL,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    "UpdatedAt" timestamp with time zone NULL,
    CONSTRAINT "PK_Activities" PRIMARY KEY ("Id")
);

CREATE INDEX IF NOT EXISTS "IX_Activities_Name" ON "Activities" ("Name");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Activities_Slug" ON "Activities" ("Slug");
CREATE INDEX IF NOT EXISTS "IX_Activities_IsActive" ON "Activities" ("IsActive");
CREATE INDEX IF NOT EXISTS "IX_Activities_DisplayOrder" ON "Activities" ("DisplayOrder");
CREATE INDEX IF NOT EXISTS "IX_Activities_CreatedAt" ON "Activities" ("CreatedAt");

-- 7. Create ActivityImages table
CREATE TABLE IF NOT EXISTS "ActivityImages" (
    "Id" uuid NOT NULL,
    "ActivityId" uuid NOT NULL,
    "ImageUrl" character varying(1000) NOT NULL,
    "PublicId" character varying(250) NULL,
    "SortOrder" integer NOT NULL,
    "IsPrimary" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK_ActivityImages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ActivityImages_Activities_ActivityId" FOREIGN KEY ("ActivityId") REFERENCES "Activities" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_ActivityImages_ActivityId_SortOrder" ON "ActivityImages" ("ActivityId", "SortOrder");

