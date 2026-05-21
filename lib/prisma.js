import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || "libsql://aqo-danbanned.aws-us-east-1.turso.io";
  const token = process.env.TURSO_AUTH_TOKEN;
  console.log("TURSO_DATABASE_URL:", url ?? "MISSING");

  const adapter = new PrismaLibSql({
    url: url,
    authToken: token,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
