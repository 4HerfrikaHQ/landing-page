import { PrismaClient } from "@prisma/client";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";

export async function generatePrismaClient(): Promise<PrismaClient> {
  if (process.env.ENV === "production") {
    const { env } = await getCloudflareContext();
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}
