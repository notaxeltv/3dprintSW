/**
 * Popola i link social di demo per screenshot/anteprima.
 * Uso: node scripts/seed-social-links.mjs
 */
import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

await prisma.settings.upsert({
  where: { id: 1 },
  create: {
    id: 1,
    companyName: "La mia azienda 3D",
    instagramUrl: "https://instagram.com/3dprintsw",
    facebookUrl: "https://facebook.com/3dprintsw",
    tiktokUrl: "https://tiktok.com/@3dprintsw",
    youtubeUrl: "https://youtube.com/@3dprintsw",
    whatsappUrl: "+39 333 1234567",
    telegramUrl: "https://t.me/3dprintsw",
    linkedinUrl: "https://linkedin.com/company/3dprintsw",
    xUrl: "https://x.com/3dprintsw",
    websiteUrl: "https://www.3dprintsw.it",
    email: "info@3dprintsw.it",
  },
  update: {
    instagramUrl: "https://instagram.com/3dprintsw",
    facebookUrl: "https://facebook.com/3dprintsw",
    tiktokUrl: "https://tiktok.com/@3dprintsw",
    youtubeUrl: "https://youtube.com/@3dprintsw",
    whatsappUrl: "+39 333 1234567",
    telegramUrl: "https://t.me/3dprintsw",
    linkedinUrl: "https://linkedin.com/company/3dprintsw",
    xUrl: "https://x.com/3dprintsw",
    websiteUrl: "https://www.3dprintsw.it",
    email: "info@3dprintsw.it",
  },
});

console.log("Link social di demo salvati.");
await prisma.$disconnect();
