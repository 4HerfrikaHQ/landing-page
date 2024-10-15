import { PrismaClient } from "@prisma/client";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { PrismaD1 } from "@prisma/adapter-d1";

export function generatePrismaClient(): PrismaClient {
  if (process.env.ENV === "production") {
    const { env } = getRequestContext();
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}
