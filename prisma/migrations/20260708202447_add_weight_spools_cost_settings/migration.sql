-- CreateTable
CREATE TABLE "Spool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "material" TEXT,
    "price" REAL NOT NULL,
    "weightGrams" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "imageUrl" TEXT,
    "material" TEXT,
    "printHours" REAL,
    "weightGrams" REAL,
    "spoolId" TEXT,
    "costPerUnit" REAL NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_spoolId_fkey" FOREIGN KEY ("spoolId") REFERENCES "Spool" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "costPerUnit", "createdAt", "description", "id", "imageUrl", "material", "minStock", "name", "price", "printHours", "subcategory", "updatedAt") SELECT "category", "costPerUnit", "createdAt", "description", "id", "imageUrl", "material", "minStock", "name", "price", "printHours", "subcategory", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT 'La mia azienda',
    "logoUrl" TEXT,
    "hourlyRate" REAL NOT NULL DEFAULT 0,
    "electricityCostPerHour" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_Settings" ("companyName", "id", "logoUrl") SELECT "companyName", "id", "logoUrl" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
