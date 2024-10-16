import { generatePrismaClient } from "@/utils/prisma";

// @ts-expect-error - top level await
export const prisma = await generatePrismaClient();
