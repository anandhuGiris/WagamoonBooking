CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "Activities" (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Slug" character varying(220) NOT NULL,
        "Description" text NOT NULL,
        "Location" character varying(200) NOT NULL,
        "Duration" character varying(100),
        "Price" numeric(18,2),
        "WhatsAppNumber" character varying(30),
        "IsActive" boolean NOT NULL DEFAULT TRUE,
        "DisplayOrder" integer NOT NULL DEFAULT 0,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_Activities" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "Facilities" (
        "Id" uuid NOT NULL,
        "Name" character varying(100) NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_Facilities" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "StayCategories" (
        "Id" uuid NOT NULL,
        "Name" character varying(100) NOT NULL,
        "Slug" character varying(120) NOT NULL,
        "Description" character varying(500),
        "IsActive" boolean NOT NULL DEFAULT TRUE,
        "DisplayOrder" integer NOT NULL DEFAULT 0,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_StayCategories" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "Users" (
        "Id" uuid NOT NULL,
        "Name" character varying(150) NOT NULL,
        "Email" character varying(256) NOT NULL,
        "PasswordHash" character varying(500) NOT NULL,
        "Role" character varying(50) NOT NULL,
        "IsActive" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "ActivityImages" (
        "Id" uuid NOT NULL,
        "ActivityId" uuid NOT NULL,
        "ImageUrl" character varying(1000) NOT NULL,
        "PublicId" character varying(250),
        "SortOrder" integer NOT NULL,
        "IsPrimary" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_ActivityImages" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_ActivityImages_Activities_ActivityId" FOREIGN KEY ("ActivityId") REFERENCES "Activities" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "Properties" (
        "Id" uuid NOT NULL,
        "Name" character varying(200) NOT NULL,
        "Description" text NOT NULL,
        "Location" character varying(200) NOT NULL,
        "Bedrooms" integer,
        "Bathrooms" integer,
        "MaxGuests" integer,
        "WhatsAppNumber" character varying(30) NOT NULL,
        "Status" character varying(20) NOT NULL,
        "CategoryId" uuid NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_Properties" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_Properties_StayCategories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "StayCategories" ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "PropertyFacilities" (
        "PropertyId" uuid NOT NULL,
        "FacilityId" uuid NOT NULL,
        CONSTRAINT "PK_PropertyFacilities" PRIMARY KEY ("PropertyId", "FacilityId"),
        CONSTRAINT "FK_PropertyFacilities_Facilities_FacilityId" FOREIGN KEY ("FacilityId") REFERENCES "Facilities" ("Id") ON DELETE CASCADE,
        CONSTRAINT "FK_PropertyFacilities_Properties_PropertyId" FOREIGN KEY ("PropertyId") REFERENCES "Properties" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE TABLE "PropertyImages" (
        "Id" uuid NOT NULL,
        "PropertyId" uuid NOT NULL,
        "ImageUrl" character varying(1000) NOT NULL,
        "PublicId" character varying(250),
        "SortOrder" integer NOT NULL,
        "IsPrimary" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        CONSTRAINT "PK_PropertyImages" PRIMARY KEY ("Id"),
        CONSTRAINT "FK_PropertyImages_Properties_PropertyId" FOREIGN KEY ("PropertyId") REFERENCES "Properties" ("Id") ON DELETE CASCADE
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Activities_CreatedAt" ON "Activities" ("CreatedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Activities_DisplayOrder" ON "Activities" ("DisplayOrder");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Activities_IsActive" ON "Activities" ("IsActive");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Activities_Name" ON "Activities" ("Name");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE UNIQUE INDEX "IX_Activities_Slug" ON "Activities" ("Slug");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_ActivityImages_ActivityId_SortOrder" ON "ActivityImages" ("ActivityId", "SortOrder");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE UNIQUE INDEX "IX_Facilities_Name" ON "Facilities" ("Name");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Properties_CategoryId" ON "Properties" ("CategoryId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Properties_CreatedAt" ON "Properties" ("CreatedAt");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Properties_Location" ON "Properties" ("Location");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Properties_Name" ON "Properties" ("Name");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_Properties_Status" ON "Properties" ("Status");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_PropertyFacilities_FacilityId" ON "PropertyFacilities" ("FacilityId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_PropertyImages_PropertyId_SortOrder" ON "PropertyImages" ("PropertyId", "SortOrder");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_StayCategories_DisplayOrder" ON "StayCategories" ("DisplayOrder");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE INDEX "IX_StayCategories_IsActive" ON "StayCategories" ("IsActive");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE UNIQUE INDEX "IX_StayCategories_Name" ON "StayCategories" ("Name");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE UNIQUE INDEX "IX_StayCategories_Slug" ON "StayCategories" ("Slug");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261104053038_AddStayCategoriesAndActivities') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261104053038_AddStayCategoriesAndActivities', '8.0.10');
    END IF;
END $EF$;
COMMIT;

