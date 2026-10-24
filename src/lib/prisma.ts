import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function ensureDatabaseUrl() {
  const currentUrl = process.env.DATABASE_URL || "file:./dev.db";

  if (process.env.VERCEL && currentUrl.startsWith("file:")) {
    const tmpDbPath = "/tmp/dev.db";
    const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (e) {
          console.error("Failed to copy sqlite db to /tmp:", e);
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

ensureDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

