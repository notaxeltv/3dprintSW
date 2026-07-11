-- CreateTable
CREATE TABLE "LabelOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Keychain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
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
    "labelOptionId" TEXT,
    "keychainId" TEXT,
    "costPerUnit" REAL NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_spoolId_fkey" FOREIGN KEY ("spoolId") REFERENCES "Spool" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_labelOptionId_fkey" FOREIGN KEY ("labelOptionId") REFERENCES "LabelOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_keychainId_fkey" FOREIGN KEY ("keychainId") REFERENCES "Keychain" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "costPerUnit", "createdAt", "description", "id", "imageUrl", "material", "minStock", "name", "price", "printHours", "spoolId", "subcategory", "updatedAt", "weightGrams") SELECT "category", "costPerUnit", "createdAt", "description", "id", "imageUrl", "material", "minStock", "name", "price", "printHours", "spoolId", "subcategory", "updatedAt", "weightGrams" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
