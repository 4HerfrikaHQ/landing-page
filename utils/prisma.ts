import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

export function prisma(env?: CloudflareEnv) {
  if (env && env.ENV === "production") {
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}
