import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  console.log("TURSO_DATABASE_URL:", url ?? "MISSING");
  console.log("TURSO_AUTH_TOKEN:", token ? "found" : "MISSING");

  const libsql = createClient({
    url: url || "file:./prisma/dev.db",
    authToken: token,
  });

  const adapter = new PrismaLibSql(libsql);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}