-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT 'La mia azienda',
    "logoUrl" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "tiktokUrl" TEXT,
    "youtubeUrl" TEXT,
    "whatsappUrl" TEXT,
    "telegramUrl" TEXT,
    "linkedinUrl" TEXT,
    "xUrl" TEXT,
    "websiteUrl" TEXT,
    "email" TEXT
);
INSERT INTO "new_Settings" ("id", "companyName", "logoUrl", "instagramUrl", "facebookUrl", "tiktokUrl", "youtubeUrl", "whatsappUrl", "telegramUrl", "linkedinUrl", "xUrl", "websiteUrl", "email") SELECT "id", "companyName", "logoUrl", "instagramUrl", "facebookUrl", "tiktokUrl", "youtubeUrl", "whatsappUrl", "telegramUrl", "linkedinUrl", "xUrl", "websiteUrl", "email" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
